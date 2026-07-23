# AR-008 — CI nunca corre la suite de `packages/domain` ni la e2e del backend

Registro completo, siguiendo el ciclo validado en AR-001, AR-028, AR-023, AR-043 y AR-052:
`Análisis → Verificación del framing → Modelo arquitectónico (si aplica) → Alternativas → Decisión →
Diseño técnico (si aplica) → Implementación → Validación → Dashboard`.

---

## Fase 1 — Evidencia

**Estado: 🟦 En progreso.** Estructurada exactamente como pidió el usuario: (1) confirmar el hallazgo,
(2) delimitar el contrato mínimo de CI, (3) buscar decisión previa que justifique el estado actual,
(4) solo entonces formular alternativas.

### 1. Hallazgo original (texto literal, Iteración 10 — `fase-2-plataforma/10-testing.md`, extendido por Iteración 17 — `fase-4-produccion/17-cicd.md`)

> _"`packages/domain`'s 15 spec files — the best-tested code in the review — are never executed by
> CI (...) The strongest test suite in the codebase currently provides zero regression protection in
> CI."_
>
> _"The e2e suite exists but never runs in CI (...) completely disconnected from any automated gate."_

Prioridad original: **Alta** (Iteración 10) / **Media, escalable a Alta** (Iteración 17, condicionada a
si el merge-gating resulta ser meramente advisory — pregunta que pertenece a AR-009, no a esta AR).

### 2. Evidencia actual de código — confirmada, y el hallazgo es más grave que en la auditoría

`.github/workflows/ci.yml` leído en su totalidad: `backend-ci` ejecuta `lint` → `nest build` →
`pnpm --filter backend run test` (unit tests únicamente). `mobile-ci` solo hace `tsc --noEmit`. Ninguno
de los dos jobs invoca `pnpm --filter domain run test` ni `pnpm --filter backend run test:e2e`.

**Agravante respecto a la auditoría original:** `packages/domain` tenía 15 archivos de spec (268 tests)
cuando se escribió el hallazgo; hoy tiene **17 archivos, 279 tests** (AR-043 añadió `credential.spec.ts`
y `session.spec.ts`). El volumen de cobertura sin protección de CI creció durante esta misma sesión de
remediación, sin que nadie lo notara — la propia AR-043 se cerró confiando en una ejecución manual de
esta suite, no en una señal de CI.

### 3. Delimitación del contrato mínimo de CI — no asumido, investigado

Antes de proponer una solución, se investigó qué exige realmente cada suite candidata:

- **`packages/domain` (jest, unit puro):** cero I/O, cero dependencias externas (confirmado durante
  toda esta sesión — cada test usa fixtures en memoria). Añadirla a CI es, en efecto, una línea de
  configuración sin riesgo de infraestructura. Effort real: **XS**, coincide con el Roadmap.

- **`apps/backend` `test:e2e` (Jest + Supertest, boot completo de `AppModule` vía
  `Test.createTestingModule`):** **no es tan simple como "una línea más".** `AppModule` registra
  `BullModule.forRoot({ connection: { host: REDIS_HOST || 'localhost' } })` de forma global — el
  arranque de cualquier test e2e intenta conectar a Redis de verdad. `docker-compose.yml` confirma que
  el proyecto ya trata Redis como dependencia de entorno local (`redis:7-alpine`, puerto 6379), pero
  **`ci.yml` no provisiona ningún servicio Redis** — wire `test:e2e` en CI tal cual exigiría añadir un
  bloque `services: redis:` al job, un cambio pequeño pero real de infraestructura, no un cambio de
  una sola línea. Effort más ajustado: **S**, no XS, solo para esta parte.

### Hallazgo colateral — no planeado, encontrado al verificar si el e2e "pasa" tal como afirma el Roadmap

Se ejecutó `test:e2e` localmente, **con Redis real y verificado accesible**
(`docker exec commitment-redis redis-cli ping` → `PONG`, `nc -zv localhost 6379` → succeeded) —
descartando que cualquier fallo se debiera a la ausencia de Redis en el entorno de prueba. Resultado:
**7 de 29 tests e2e fallan de forma reproducible**, en dos patrones distintos:

1. **Conflicto de versión (409) en el primer comando sobre una entidad recién creada.**
   `POST /commitments/:id/activate` sobre un Commitment recién registrado devuelve 409, no 200
   (`commitments.e2e-spec.ts`); `POST /goals/:id/complete` sobre un Goal recién creado devuelve 409, no
   200 (`goals.e2e-spec.ts`, en 3 tests distintos: complete idempotente, 409-para-completado, y
   history). Verificado que no es contaminación entre tests: `beforeEach` crea un
   `TestingModule`/`AppModule` completamente nuevo por test (DI container fresco, repos en memoria
   vacíos). El patrón (conflicto en el primer `save()` posterior al registro) apunta a algo introducido
   por el trabajo de concurrencia optimista de AR-028 — posiblemente una interacción entre el
   `eventDispatcher.dispatch()` del handler de registro (que corre antes de `clearUncommittedEvents()`)
   y algún consumidor de ese evento (p. ej. `RecurringCommitmentSaga`) que vuelve a tocar el agregado.
   **No se investigó más allá de esto — excede el alcance de Fase 1 de AR-008, que es sobre CI, no
   sobre corregir la lógica de dominio.**
2. **Fuga de recursos en el teardown de BullMQ.** Al cerrar la app (`afterEach` → `app.close()`), un
   `Worker` de BullMQ (del módulo de notificaciones) deja listeners activos que lanzan
   `Unhandled error (Connection is closed)` de forma asíncrona — Jest atribuye estos errores al test que
   esté corriendo en ese momento, aunque no tenga relación alguna con el fallo (confirmado: hasta un
   `GET /goals/:id` → 404, que no toca `Commitment`/`Goal` en absoluto, aparece marcado como fallido por
   este motivo). El propio Jest lo señala: _"A worker process has failed to exit gracefully... tests
   leaking due to improper teardown."_

**Esto no es evidencia de que el problema esté en el entorno de prueba — es una regresión real y
silenciosa que ya existe en `main`, sin ningún mecanismo actual capaz de detectarla.** Es, de hecho, la
demostración más directa posible de por qué AR-008 importa: el propio ejercicio de verificar el
hallazgo de AR-008 reprodujo el riesgo exacto que AR-008 existe para cerrar.

**Tratamiento, siguiendo la regla ya establecida en AR-028 (los hallazgos colaterales no expanden el
alcance de la AR en curso):** se registra aquí como hallazgo, no se corrige dentro de AR-008. Pendiente
de que el usuario decida: (a) abrir una AR nueva para el bug de OCC/Sagas y otra (o la misma) para el
teardown de BullMQ, o (b) tratarlo como bloqueante de la Fase 3 de AR-008 (si el e2e debe entrar a CI
como gate, no puede hacerlo mientras falle genuinamente).

### 4. ¿Existe alguna decisión previa (ADR, README, gobernanza) que justifique el estado actual?

Búsqueda exhaustiva: no existe `CONTRIBUTING.md`. `local_setup_guide.md` documenta Redis como
requisito de entorno local (`docker compose up -d`) pero no menciona CI en ningún punto. Ninguna ADR
(`docs/01-product/adr/`, `docs/03-architecture/`) menciona la suite de CI. **No hay ninguna decisión
previa que explique por qué domain/e2e nunca se conectaron — es, tal como concluyó la auditoría, una
omisión, no una decisión deliberada.**

### Pregunta de framing para Fase 2, antes de proponer alternativas

Dado el hallazgo colateral, la pregunta que abre Fase 2 ya no es solo _"¿cómo conectamos estas dos
suites a CI?"_ — es: **¿debe AR-008 conectar `test:e2e` a CI en su estado actual (con 2 fallos reales
sin corregir), o el orden correcto es primero registrar/resolver esos fallos por separado, y solo
entonces convertir `test:e2e` en gate?** La suite de `packages/domain`, en cambio, no tiene ninguna
complicación equivalente — pasa limpiamente hoy (279/279) y puede conectarse sin ninguna dependencia de
esta pregunta.

---

## Fase 2 — Verificación del framing

**Estado: ✅ Cerrada.** El usuario separa dos preguntas que el framing original mezclaba:

> **AR-008 responde:** ¿el pipeline de CI verifica las suites que forman parte del contrato de calidad
> del proyecto?
>
> **Los dos bugs responden una pregunta distinta:** ¿la suite e2e es actualmente estable y
> determinista?

La segunda no es un problema de cobertura de CI — es un problema de calidad de la propia suite (y, en
el caso del 409, posiblemente del dominio/AR-028). Mezclarlas dentro de AR-008 repetiría exactamente el
error que el programa ya evitó con `InMemoryEventStore` en AR-028: un hallazgo colateral no expande el
alcance de la AR en curso si puede aislarse como investigación independiente.

**Reformulación del objetivo de AR-008, más precisa que la original:**

> No: _"conectar `domain` y `e2e` a CI."_
>
> Sino: **"garantizar que CI ejecute todas las suites que actualmente cumplen los criterios para
> actuar como quality gate."**

Bajo este framing, el estado de cada suite es una conclusión, no una suposición:

- **`packages/domain`: ✅ elegible hoy.** Pasa limpio (279/279), sin dependencias externas.
- **`apps/backend` `test:e2e`: ❌ no elegible todavía — por estabilidad, no por infraestructura.**
  Añadir un servicio Redis al workflow habría sido trivial; lo que lo descalifica son los 2 fallos
  reales encontrados en Fase 1.

**Decisión de alcance, separando los dos bugs entre sí** (el usuario los distingue explícitamente
porque huelen a causas no relacionadas — uno de dominio/eventos, otro de infraestructura de testing/
lifecycle — agruparlos generaría una AR artificialmente heterogénea):

- **AR-053** (nueva): 409 reproducible en el primer comando (`activate`/`complete`) sobre una entidad
  recién creada — posible interacción entre el `eventDispatcher.dispatch()` del handler de registro y
  algo que reacciona a ese evento (Saga u otro consumidor), con AR-028 como antecedente directo más
  probable.
- **AR-054** (nueva): fuga de recursos en el teardown de `BullMQ Worker` al cerrar la app — errores no
  capturados que contaminan tests no relacionados con notificaciones.

Ninguna de las dos bloquea el cierre de AR-008. `test:e2e` queda registrado como _"no elegible hoy"_ —
no como _"pendiente de AR-008."_ La decisión de cuándo (y si) `test:e2e` se convierte en gate de CI
pertenece a una futura AR (o a la reapertura de esta, con evidencia nueva), condicionada a que
AR-053/AR-054 cierren primero.

---

## Fase 3 — Decisión

**Estado: ✅ Decisión aprobada (N/A en el eje — ejecución directa, sin alternativa real que pesar para
la parte de `packages/domain`).**

> **D-008.1:** CI ejecuta `packages/domain`'s test suite como parte del contrato mínimo de calidad. La
> suite `test:e2e` de `apps/backend` no se conecta en esta AR — queda marcada explícitamente como "no
> elegible todavía" hasta que AR-053 y AR-054 cierren.

Pendiente: Fase 4 (Implementación) — añadir el paso de CI para `packages/domain`.

---

## Fase 4 — Implementación

**Estado: ✅ Completa.** `.github/workflows/ci.yml`, job `backend-ci`: añadido un paso `Test Domain`
(`pnpm --filter domain run test`) inmediatamente después de `Test Backend`. Verificado localmente antes
de confiar en el nombre del filtro: `packages/domain`'s `package.json` declara `"name": "@commitment/domain"`
(con scope), no `"domain"` a secas — se confirmó explícitamente que `pnpm --filter domain` resuelve
correctamente contra el nombre con scope (pnpm empareja por sufijo/nombre corto, no solo por nombre
exacto) antes de dar el paso por válido, en vez de asumirlo por analogía con `--filter backend`
(`apps/backend`'s `package.json` sí se llama literalmente `"backend"`, sin scope — no es el mismo caso).

`test:e2e` deliberadamente NO se añade a `ci.yml` en esta AR — permanece fuera hasta que AR-053/AR-054
cierren, tal como decidió Fase 2.

## Fase 5 — Validación

**Estado: ✅ Completa.**

- `pnpm --filter domain run test` ejecutado directamente (no solo inferido): **17 suites / 279 tests,
  todos pasan.**
- `apps/backend`'s propia suite de unit tests, ejecutada de nuevo para confirmar cero regresión por el
  cambio de CI (un cambio de configuración, no de código de aplicación): **31 suites / 139 tests, todos
  pasan.**
- Criterio de aceptación binario, tal como propuso el usuario al abrir esta AR — **"¿puede fusionarse
  código que rompa `packages/domain` sin que CI falle?"** Antes: sí. Después de este cambio: no —
  cualquier fallo en las 279 pruebas de dominio ahora hace fallar el job `backend-ci`.

## AR-008 CERRADA

**Resumen del ciclo:** el hallazgo original se confirmó y resultó más grave de lo documentado (279 vs.
268 tests sin protección). La verificación activa del framing (Fase 1/2) descubrió que la mitad del
hallazgo original ("e2e existe y pasa") ya no era cierta, y que forzarlo a CI tal cual habría sido
tratar un problema de estabilidad de la suite como si fuera solo un problema de conectividad de CI —
exactamente el tipo de distinción que este programa exige antes de proponer una solución. El hallazgo
colateral (2 bugs reales) se aisló en **AR-053** y **AR-054**, sin expandir ni bloquear el cierre de
esta AR, seleccionado sobre la alternativa de investigar/corregir ahora mismo o de posponer la decisión
sin resolverla — manteniendo la propiedad que el usuario señaló como una de las fortalezas más
consistentes del programa: **cada AR responde exactamente una pregunta.**

**Quinta remediación del programa completada de principio a fin — la primera puramente de
infraestructura de proceso (no de dominio ni de bounded context), y la primera en generar dos AR nuevas
en un solo cierre.** Estabilidad metodológica: 5/5 ARs cerradas sin excepciones al ciclo de 9 fases
(100%) — ninguna fase se saltó pese al hallazgo colateral inesperado.
