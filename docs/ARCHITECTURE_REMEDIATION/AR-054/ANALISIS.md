# AR-054 — Integración incompleta con el contrato de errores de BullMQ durante el ciclo de vida de la aplicación

**Título revisado (2026-07-23), tras revisión del usuario como Review Board.** El título original ("fuga
de recursos / errores no capturados en el teardown") presuponía una fuga de memoria/conexión y, en cierto
modo, culpaba a BullMQ. El framing corregido es más preciso: no presupone una fuga, no culpa a la
librería, e identifica con claridad que el defecto vive en la capa de integración de la aplicación, no en
BullMQ ni en el propio proceso de cierre.

Registro completo, siguiendo el ciclo validado en AR-001, AR-028, AR-023, AR-043, AR-052, AR-008 y AR-053:
`Análisis → Verificación del framing → Modelo arquitectónico (si aplica) → Alternativas → Decisión →
Diseño técnico (si aplica) → Implementación → Validación → Dashboard`.

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.** Alcance acotado a los mismos 4 objetivos que AR-053: (1) reproducir, (2) localizar
el primer punto donde aparece el error, (3) identificar qué componente lo produce realmente, (4) construir
la línea temporal completa. Sin depurar ni proponer soluciones todavía.

### Pregunta de framing que gobierna esta fase

> **¿Es esto una fuga de recursos que impide el cierre del proceso (handle abierto), o es otra cosa?**

El framing original, heredado de AR-008/AR-053, asumía lo primero: _"`BullMQ Worker` no cierra
correctamente su conexión a Redis en `app.close()`"_. La Fase 1 refuta esa parte específica del framing
— ver más abajo.

### 1. Reproducción

**No determinista — a diferencia de AR-053, este hallazgo no reproduce el 100% de las veces.** Ejecuciones
realizadas en esta sesión:

- `goals.e2e-spec.ts` con `--detectOpenHandles` (para descartar explícitamente un handle abierto): **19/19
  tests pasan, cero errores no capturados, Jest termina solo sin necesitar `--forceExit` y sin imprimir
  ningún aviso de "Jest did not exit" ni ningún handle detectado.**
- En ejecuciones previas (misma suite, sin `--detectOpenHandles`, ver `AR-053/ANALISIS.md` y el cierre de
  AR-008): entre 1 y 3 tests por ejecución completa de la suite terminan marcados como fallidos, siempre
  con la firma exacta `Unhandled error. (Error: Connection is closed.)`, **nunca la misma prueba dos veces**
  (afectó a `"should complete a goal idempotently"` en una ejecución, a `"should rename a goal"` y
  `"should return 404 for unknown goal id"` en otra, a `"GET /goals — should list registered goals"` en
  otra más).
- Cada test señalado como "fallido" por este motivo **pasa limpio cuando se ejecuta en aislamiento**
  (`-t "..."`) — confirmado explícitamente durante AR-053.

**Conclusión de la reproducción: es una condición de carrera (race condition), no un fallo determinista.**
Esto ya es evidencia en contra de la hipótesis "handle abierto que impide cerrar el proceso" — un handle
realmente abierto se manifestaría como "Jest did not exit" de forma consistente, no como un error atribuido
aleatoriamente a un test distinto en cada ejecución.

### 2 y 3. Punto exacto de origen y componente que lo produce

Rastreado dentro de `bullmq@5.79.3` (paquete real en `node_modules`, no infraestructura propia):

**`RedisConnection` (`bullmq/dist/cjs/classes/redis-connection.js`)** — en su constructor, registra:

```js
this.handleClientError = (err) => {
  this.emit('error', err);
};
// ...
this._client.on('error', this.handleClientError);
```

Es decir: cualquier evento `'error'` del cliente `ioredis` subyacente se reemite como el propio evento
`'error'` de `RedisConnection`.

**`QueueBase` (`bullmq/dist/cjs/classes/queue-base.js`, línea 43)** y **`Worker`
(`bullmq/dist/cjs/classes/worker.js`, línea 129)** hacen exactamente lo mismo un nivel arriba:

```js
// queue-base.js:43
this.connection.on('error', (error) => this.emit('error', error));
// worker.js:129
this.blockingConnection.on('error', (error) => this.emit('error', error));
```

**Esto es el contrato documentado de BullMQ, no un bug de la librería**: tanto `Queue` como `Worker`
esperan que la aplicación consumidora registre su propio `.on('error', ...)` — igual que cualquier
`EventEmitter` de Node. Si nadie escucha el evento `'error'` de un `EventEmitter`, Node lo lanza de forma
síncrona (comportamiento documentado de Node, no de BullMQ).

**Verificado por `grep` exhaustivo en `apps/backend/src/notifications` y `src/app.module.ts`: cero
registros de `.on('error', ...)`, `@OnWorkerEvent`, o `@OnQueueEvent` en todo el codebase.** Ni
`BullMQExecutionEngine` (que inyecta la `Queue` vía `@InjectQueue('reminders')`) ni `ReminderProcessor`
(que extiende `WorkerHost`, expuesto como `@Processor('reminders')`) registran un listener de error.

**Componente responsable exacto:** la `Queue` `reminders` (registrada por `BullModule.registerQueue({name:
'reminders'})` en `NotificationsModule`) y/o el `Worker` que `@nestjs/bullmq`'s `BullExplorer` crea
internamente para `ReminderProcessor` — ambos, sin un listener de error propio, heredan el comportamiento
por defecto de Node: cualquier error de conexión ocurrido en cualquier momento de su ciclo de vida
(incluido durante o después del cierre) se convierte en una excepción no capturada.

**Verificado que el cierre en sí (`RedisConnection.close()`, líneas 398-432 del mismo archivo) sí se
ejecuta y se espera correctamente** — `await this._client.quit()`, seguido de la desconexión de los 3
listeners internos (`error`/`close`/`ready`). El listener de error interno de `RedisConnection`
(`handleClientError`) se elimina recién en el bloque `finally`, es decir, **durante el propio `quit()`
sigue activo** — si el socket subyacente emite un `'error'` en esa ventana (p. ej. al recibir un `RST`/EOF
del servidor Redis mientras el `QUIT` todavía está en tránsito, un patrón conocido de ioredis bajo carga
concurrente de conexiones), se reemite hacia arriba exactamente como se describió, y como nadie escucha en
la capa de aplicación, Node lo lanza.

**Esto reencuadra el hallazgo: no es que `app.close()` deje una conexión sin cerrar (el cierre si ocurre y
se espera correctamente) — es que el cierre en sí puede, en una ventana de tiempo estrecha, disparar un
evento `'error'` que nadie en la aplicación está preparado para recibir.**

### 4. Línea temporal

| Fecha            | Commit               | Evento                                                                                                                                                                                                                                                                                     |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-08       | `12c74ad`            | _"feat(notifications): implement BullMQ execution engine and dispatcher"_ — introduce `BullMQExecutionEngine` (`@InjectQueue('reminders')`) y `ReminderProcessor` (`@Processor('reminders')`, extiende `WorkerHost`). **Ningún listener de error se añade en este commit.**                |
| 2026-07-08 → hoy | —                    | `git log --oneline` sobre ambos archivos no muestra ningún commit posterior — el código no ha cambiado desde su creación. **Cero listeners de error han existido nunca en este codebase, no es una regresión: es una omisión desde el día de introducción de BullMQ.**                     |
| 2026-07-23       | AR-008               | Se descubre el síntoma por primera vez, al ejecutar `test:e2e` con Redis real por primera vez en la historia del proyecto (nunca antes se había corrido la suite completa contra Redis real en secuencia — `test:e2e` nunca corrió en CI ni, aparentemente, localmente de forma completa). |
| 2026-07-23       | AR-053               | Confirma que el síntoma es no determinista, coincide con `Unhandled error (Connection is closed)`, y que cada test afectado pasa limpio en aislamiento — pero no investiga la causa raíz (fuera de su propio alcance, correctamente).                                                      |
| 2026-07-23       | AR-054 (esta Fase 1) | Localiza el origen exacto: falta de listeners `.on('error', ...)` en `Queue`/`Worker`, dentro del contrato ya documentado de BullMQ — no una fuga de conexión ni un handle que impide `app.close()`.                                                                                       |

### Respuesta a la pregunta de framing

> **No es una fuga de recursos que impida el cierre del proceso.** `--detectOpenHandles` no detecta ningún
> handle abierto, y la mayoría de las ejecuciones terminan limpiamente sin necesitar `--forceExit`. **Es
> una condición de carrera: en una ventana de tiempo dentro del propio cierre de la conexión (`quit()`),
> un evento `'error'` de `ioredis` puede dispararse antes de que el listener interno de BullMQ se
> desregistre — y como la aplicación nunca registró su propio listener de error en la `Queue` ni en el
> `Worker`, Node lo lanza como excepción no capturada, que Jest atribuye al test que esté corriendo en ese
> instante exacto.** El framing heredado de AR-008 ("no cierra correctamente su conexión") queda
> parcialmente refutado — el cierre sí ocurre y se espera; lo que falta es manejo de errores durante esa
> ventana, no un cierre ausente.

**Consecuencia para el alcance de AR-054:** a diferencia de AR-053, aquí sí existe un defecto real —
la aplicación no cumple un contrato de integración que la propia librería documenta (registrar un listener
de error en cada `Queue`/`Worker`). No es un falso positivo. En qué consiste exactamente la remediación
(qué hace ese listener, si basta con uno simple o si el comportamiento correcto depende de un patrón ya
usado en otra parte del proyecto) es una pregunta de Fase 2B/Decisión, no de esta fase — ver la
comprobación de precedentes a continuación, que es lo único que faltaba para cerrar Fase 1 con solidez.

### 5. Comprobación de precedentes internos (2026-07-23, a petición del usuario, antes de decidir)

**Pregunta:** ¿existe algún punto del proyecto donde ya se gestione correctamente el evento `error` de
BullMQ o de otro componente `EventEmitter` similar?

**Búsqueda realizada:**

```
grep -rn "\.on('error'\|\.on(\"error\"\|OnWorkerEvent\|OnQueueEvent\|addListener('error'" \
  --include="*.ts" apps packages
```

**Resultado: cero coincidencias en todo el monorepo** (`apps/backend`, `apps/mobile`, `packages/*`),
excluyendo specs. No existe ningún punto — ni en Notifications, ni en Messaging, ni en Observability —
donde la aplicación registre un listener de error sobre un `EventEmitter` de una librería externa.

**Único patrón relacionado encontrado, y por qué NO cuenta como precedente directo:**
`apps/backend/src/otel.ts` registra `process.on('SIGTERM', () => otelSDK.shutdown()...)` — un apagado
correcto del SDK de OpenTelemetry ante una señal del proceso. Es un precedente de _"cerrar
ordenadamente un recurso externo ante un evento del ciclo de vida del proceso"_, pero no del problema que
investiga esta AR: (a) reacciona a una señal de proceso (`SIGTERM`), no al evento `'error'` de un
`EventEmitter` de una librería; (b) no se dispara durante `app.close()` en los tests e2e (que no emiten
`SIGTERM`) — de hecho, si el mismo patrón se aplicara literalmente a BullMQ, tampoco resolvería el
síntoma observado aquí, porque el error ocurre durante el cierre invocado explícitamente por
`afterEach`, no durante un cierre por señal.

**Confirmado: no existe ningún precedente interno para este patrón específico** (manejar el evento
`'error'` de un `EventEmitter` de una librería externa integrada vía DI). Consecuencia directa, tal como
anticipó el usuario: **Fase 2B no será "aplicar de forma consistente un patrón ya aceptado" — será
genuinamente una decisión de diseño de integración**, sin un precedente interno que la simplifique o
la condicione.

---

## Fase 2B — Alternativas

**Estado: ✅ Cerrada.**

### Pregunta de decisión que gobierna esta fase

> **¿Cómo debe cumplir la aplicación el contrato de propagación de errores de BullMQ durante su ciclo de
> vida?**

Deliberadamente no formulada como _"¿dónde ponemos un `.on('error')`?"_ — esa forma ya presupone una
implementación concreta y saltaría directamente a Fase 4A sin pasar por la decisión arquitectónica real.

### Alternativas comparadas

**A. Ignorar el contrato (mantener el estado actual).**
Ventaja: cero cambios. Desventajas: ya produce excepciones no capturadas de forma reproducible;
incumple el contrato documentado por BullMQ; introduce no determinismo en la ejecución de pruebas.
**Descartada por la evidencia de Fase 1** — no es una opción neutral, es continuar un defecto ya
confirmado.

**B. Registrar listeners locales, uno por cada `Queue`/`Worker` existente.**
Ventajas: simple, poco código, cambio mínimo. Desventajas: duplica el mismo manejo en cada punto de
integración; nada impide que un futuro `Queue`/`Worker` se añada sin su listener (el propio defecto
actual es exactamente ese olvido, solo que desde el día de introducción de BullMQ en vez de una
regresión posterior); el patrón queda distribuido y depende de que cada autor lo recuerde.

**C. Definir un patrón de integración obligatorio para todo componente BullMQ registrado por la
aplicación.** La decisión se formula como propiedad del sistema, no como ubicación de código: _"ningún
`Queue`/`Worker` que la aplicación registre puede considerarse una integración válida sin un manejador
explícito de su evento `error`."_ Cómo se materializa esa propiedad (bootstrap centralizado, factory,
wrapper, provider) es una pregunta de Fase 4A/Diseño técnico, deliberadamente no resuelta aquí — mismo
patrón que D-043.1 (formulada sin mencionar JWT/Guards/Passport).

### Por qué C sobre B

El hallazgo de Fase 1 no describe dos puntos de código aislados — describe un contrato que BullMQ exige
a cualquier integración, presente o futura. Un contrato se expresa como regla general, no como una
corrección puntual en los 2 sitios ya conocidos. Si mañana se añade un tercer `Worker` (p. ej. para otro
tipo de recordatorio), su corrección no debería depender de que alguien recuerde replicar el mismo
`.on('error', ...)` — debería ser consecuencia necesaria de cómo se registra cualquier componente BullMQ
en la aplicación.

---

## Fase 3 — Decisión

**Estado: ✅ Decisión aprobada.**

**D-054.1:** _"Ningún `Queue` ni `Worker` de BullMQ registrado por la aplicación se considera una
integración completa sin un manejador explícito de su evento `error`. Esta obligación es una propiedad
del sistema, verificable por revisión de código, no una corrección puntual sobre los 2 puntos de
integración conocidos hoy (`BullMQExecutionEngine`, `ReminderProcessor`)."_

Formulada sin mencionar mecanismo de implementación (bootstrap/factory/wrapper/provider, nivel de log,
si el error se reintenta o solo se registra) — esas preguntas pertenecen a Fase 4A (Diseño técnico), no a
esta decisión, siguiendo el mismo patrón que congeló D-043.1 en términos de responsabilidad, no de
tecnología.

### Criterio de aceptación (fijado antes de Fase 4A, no después)

> **Toda instancia de `Queue` o `Worker` creada por la aplicación registra explícitamente un manejador
> para el evento `error`.**

Objetivo y verificable por `grep`/revisión de código — mismo estilo que el criterio binario que cerró
AR-008 ("¿puede fusionarse código que rompa `packages/domain` sin que CI falle?").

### Hallazgo metodológico de esta fase, registrado como hipótesis en observación (no regla todavía)

A diferencia de AR-053 (donde el sistema cumplía correctamente su propio contrato de dominio y el
defecto estaba en un test desactualizado), aquí el contrato externo — el de BullMQ — estaba bien
definido desde el principio; lo incompleto era la integración de la aplicación con él. Hipótesis
registrada en README (1 punto de dato): _"cuando el sistema interactúa con otro sistema, el contrato de
integración debe tratarse con el mismo rigor que un contrato de dominio."_

---

## Plan de reanudación para Fase 4A (Diseño técnico) — registrado 2026-07-23, sesión cerrada aquí

Misma disciplina que AR-043: Fase 4A no discute código todavía, discute invariantes de diseño. Preguntas
de apertura, en orden, antes de elegir mecanismo (provider/factory/bootstrap/wrapper):

1. ¿Quién es el propietario del contrato de integración con BullMQ dentro de la aplicación?
2. ¿Dónde debe existir el registro del manejador de error para que no pueda omitirse accidentalmente al
   añadir un futuro `Queue`/`Worker`?
3. ¿Cómo se evita que una futura integración BullMQ viole D-054.1 sin que nadie lo note?
4. ¿El cumplimiento de D-054.1 debe ser obligatorio por construcción (imposible de omitir) o solo
   verificable por convención (posible de omitir, pero detectable por revisión/lint)?

Solo después de responder estas 4 preguntas corresponde elegir la materialización concreta.

---

## Estado

**Fase 1, Fase 2B y Fase 3 cerradas.** D-054.1 aprobada: la solución debe ser un patrón de integración
general (Alternativa C), no listeners locales aislados (Alternativa B) ni mantener el estado actual
(Alternativa A). Pendiente: Fase 4A (Diseño técnico — dónde y cómo se implementa el patrón) y Fase 4B
(Implementación) — no iniciadas todavía. **Sesión cerrada aquí a petición del usuario** — D-054.1 queda
congelada, Fase 4A queda para la próxima sesión, con el plan de reanudación de arriba ya registrado.
Estado (eje Estado): se mantiene 🟦 En análisis (no salta a 🟨 hasta que arranque Fase 4B, mismo patrón
que AR-028/AR-043). Decisión: ✅ Decisión aprobada.
