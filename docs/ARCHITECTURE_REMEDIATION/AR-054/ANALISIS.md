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

## Estado

**Fase 1 cerrada, incluida la comprobación de precedentes.** Tres afirmaciones quedan establecidas por
evidencia directa: (1) no hay fuga persistente de recursos; (2) el síntoma es no determinista pero el
mecanismo que lo produce no lo es; (3) existe un incumplimiento concreto y sin precedente interno del
contrato de integración de BullMQ. Pendiente: Fase 2B (Alternativas de manejo de error) y Decisión — no
iniciadas todavía, a la espera de que el usuario dé paso.
