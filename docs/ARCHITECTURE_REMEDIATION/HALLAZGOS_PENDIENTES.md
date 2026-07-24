# Hallazgos pendientes (no promovidos todavía a AR formal)

Registro deliberadamente ligero — distinto de `REMEDIATION_ROADMAP_V1.md` (que solo trackea ARs con ID
asignado). Un hallazgo entra aquí cuando surge durante el trabajo de una AR pero su investigación (¿es
un defecto real? ¿de quién es la responsabilidad? ¿merece una AR propia?) todavía no ha empezado —
evita tanto perderlo como promoverlo prematuramente a un AR-ID permanente sin evidencia suficiente para
justificar su alcance.

---

## H-P-001 — Comportamiento residual durante el cierre de `RedisConnection` en BullMQ 5.79.3

**Estado: Pendiente de investigación.** **Propietario: BullMQ / ciclo de vida interno de
`RedisConnection`, no la integración de la aplicación.** **Origen: descubierto durante la Fase 4B/5 de
AR-054 (2026-07-23)** — ver `AR-054/ANALISIS.md` para el contexto completo de cómo se llegó aquí.

### Hipótesis (no confirmada como defecto de la librería)

Una condición de carrera interna a `RedisConnection.close()`: cuando el estado de la conexión al
momento del cierre no es `'ready'` ni `'initializing'` (p. ej. quedó en `'reconnecting'` por la propia
carrera de teardown), se toma una rama de `close()` que nunca suprime el `.catch()` original de
`this.initializing` (adjunto en el constructor, línea 87 de `redis-connection.js`). Si esa promesa se
resuelve _después_ de que el bloque `finally` de `close()` ya ejecutó `this.removeAllListeners()` —que
borra el listener que `Queue`/`Worker` habían registrado sobre esa `RedisConnection`—, el
`emit('error', ...)` resultante no tiene ningún listener, y Node lo lanza como excepción no capturada.
Confirmado empíricamente instrumentando `EventEmitter.prototype.emit` directamente: el emisor sin
listener es la propia `RedisConnection`, no la `Queue` ni el `Worker` de la aplicación.

### Investigación previa (2026-07-23), respondiendo las 3 preguntas fijadas antes de decidir cualquier acción

1. **¿Está reproducido en la versión más reciente de BullMQ?** Sí. `bullmq` publicado más reciente en el
   registro de npm es `5.80.12` (instalado en este proyecto: `5.79.3`); no hay evidencia de que el
   defecto se haya corregido en versiones posteriores — el issue upstream de referencia (ver abajo)
   sigue abierto y sin resolución oficial a la fecha de esta investigación.
2. **¿Existe un issue abierto?** Sí — **[taskforcesh/bullmq#3546](https://github.com/taskforcesh/bullmq/issues/3546)**,
   _"Intermittent 'Error: Connection is closed' during shutdown (BullMQ + ioredis)"_, abierto, etiquetado
   `cannot reproduce`. Describe exactamente el mismo síntoma y el mismo stack trace
   (`event_handler.js:214:25` → `Socket.<anonymous> event_handler.js:181:20`) que reprodujimos aquí de
   forma independiente. El mantenedor (`manast`) respondió pidiendo explícitamente una reproducción en
   BullMQ puro, sin NestJS de por medio — nuestra reproducción (aislada a `apps/backend`, con línea
   exacta y rama de código identificada) podría ser justamente ese caso, más precisa que la reportada
   originalmente en el issue.
3. **¿Existe una mitigación oficial?** No, ninguna de los mantenedores. Sí existen **dos propuestas de
   parche no oficiales**, publicadas por un usuario de la comunidad (`loxy`) en el mismo issue,
   apuntando exactamente a la causa que identificamos de forma independiente:
   - **Opción A:** volver a adjuntar un listener no-op de error justo después de `removeAllListeners()`
     en el bloque `finally` de `close()`, para absorber errores tardíos.
   - **Opción B:** diferir `removeAllListeners()` con `setImmediate()`, para que corra después de que
     los manejadores de desconexión de ioredis ya se hayan disparado.
     Ninguna está mergeada ni oficialmente respaldada. El mismo hilo confirma independientemente que
     intentar mitigarlo solo con `.on('error', ...)` a nivel de aplicación (exactamente lo que
     implementamos en D-054.1) **no es suficiente** — coincide con lo que observamos nosotros mismos.

### Por qué no se investiga más a fondo todavía

Consistente con el mismo principio que cerró la Fase 4A de AR-054 (no perseguir una propiedad más fuerte
que la que la evidencia justifica): esto es un defecto de un tercero, ya reportado y ya en seguimiento
upstream, sin mitigación oficial. Parchear localmente `redis-connection.js` (vía `pnpm patch` o similar)
sería una intervención invasiva sobre una dependencia externa, deliberadamente fuera del alcance que
D-054.1 congeló.

### Próximos pasos posibles (ninguno decidido todavía)

- Comentar en taskforcesh/bullmq#3546 con la reproducción propia (más precisa que la original —
  aislada a un solo proyecto, con línea de código exacta), ya que el mantenedor pidió explícitamente un
  caso reproducible en BullMQ puro.
- Evaluar `pnpm patch` con la Opción A o B del hilo, si el residuo empieza a afectar de forma
  significativa la señal de CI (hoy no ocurre — ver AR-054/ANALISIS.md, Fase 5).
- Revisar de nuevo cuando el proyecto actualice `bullmq` a una versión posterior, para confirmar si
  sigue reproduciendo.

---

## H-P-002 — `turbo run build --filter=<pkg>` falla dentro de contenedores Linux/musl cuando una dependencia de workspace no tiene script `build`

**Estado: Pendiente de investigación.** **Propietario: Turborepo (posible incompatibilidad
Alpine/musl) o, alternativamente, ausencia de un script `build` no-op en `@commitment/config`, no la
arquitectura del backend.** **Origen: descubierto durante la Fase 4B de AR-045 (2026-07-23)** — ver
`AR-045/ANALISIS.md` para el contexto completo.

### Síntoma

`pnpm turbo run build --filter=backend` (o `--filter=@commitment/shared`) falla dentro de una imagen
`node:20-alpine` con:

```
@commitment/shared:build: cache miss, executing <hash>
@commitment/shared#build:  ERROR  command finished with error: No such file or directory (os error 2)
 ERROR  @commitment/shared#build: unable to spawn child process: No such file or directory (os error 2)
```

El mismo comando (`pnpm run build` en la raíz, sin `--filter`, ejecutado en el host macOS) no produce
ningún error visible — los paquetes sin script `build` (como `@commitment/config`) simplemente no
cuentan entre las tareas ejecutadas ("8 successful, 8 total" de 10 paquetes en scope).

### Diagnóstico (2026-07-23)

`pnpm turbo run build --filter=@commitment/shared --dry=json` revela que `@commitment/config`
(dependencia de desarrollo de `@commitment/shared`/`@commitment/domain`, sin campo `scripts.build` en
su `package.json`) resuelve a `"command": "<NONEXISTENT>"` en el grafo de tareas — un valor placeholder
que, en este entorno (Linux, imagen Alpine/musl, invocado con `--filter`), turbo intenta ejecutar
literalmente como un proceso real, produciendo el `os error 2` observado. Se descartaron como causa:
ausencia de `bash` (instalado, mismo error), ausencia de `libc6-compat` (instalado, mismo error),
ausencia de un shell (`/bin/sh` funciona correctamente y `pnpm --filter=<pkg> run build` funciona sin
problema usándolo).

### Por qué no se investiga más a fondo todavía

Mismo criterio que H-P-001: no está claro todavía si el defecto es de Turborepo (manejo del
placeholder `<NONEXISTENT>` en un entorno Linux/musl con `--filter`) o simplemente la ausencia de un
script `build` no-op en `@commitment/config` — ninguna de las dos hipótesis se ha confirmado ni
descartado con evidencia suficiente, y decidir cuál corregir (parchear/reportar Turborepo vs. añadir
un script trivial a un paquete ajeno a AR-045) excede el alcance de esta AR. **Evitado, no corregido,
en `apps/backend/Dockerfile`:** el build de la imagen invoca `pnpm --filter=<pkg> run build`
explícitamente en el orden real de dependencias (`@commitment/shared` → `@commitment/domain` →
`backend`) en vez de delegar en `turbo run build --filter=backend`, evitando el fallo sin modificar
`packages/config` ni ningún otro paquete.

### Próximos pasos posibles (ninguno decidido todavía)

- Reproducir el `--dry=json` fuera de un contenedor Linux (p. ej. una VM Linux nativa, no Docker) para
  aislar si el factor determinante es Alpine/musl específicamente o Linux en general.
- Evaluar añadir un script `"build": "true"` (no-op) a `packages/config/package.json` si el patrón
  vuelve a aparecer en una futura AR de CI/CD (Fase 4A de AR-045 dejó GitHub Actions explícitamente
  fuera de alcance) — decisión que le corresponde a esa AR, no a esta.
- Reportar el comportamiento a Turborepo si se confirma que es específico del proyecto/entorno y no un
  error de configuración local.
