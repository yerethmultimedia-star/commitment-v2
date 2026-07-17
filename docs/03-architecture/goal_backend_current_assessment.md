# Current Backend Assessment — insumo para la iniciativa "Goal Backend / CQRS / Event Store"

**Estado:** Documento de investigación (Paso 1 del proceso). No contiene ninguna decisión — ni a
favor ni en contra de CQRS o Event Store. Su único propósito es documentar, con evidencia
verificada leyendo el código directamente, qué existe hoy y qué limitaciones reales tiene, antes
de evaluar alternativas.

---

## 1. Modelo de persistencia actual

**Goal no tiene backend.** `packages/domain/src/goal/` es un Aggregate Root completo (eventos de
dominio, `GoalRepository` como interfaz, motor de cálculo de progreso) pero `apps/backend/src/`
no tiene ningún módulo `goal/`. Confirmado en dos lugares que ya lo documentan honestamente en su
propio código:

- `packages/domain/src/goal/repositories/goal.repository.ts` — interfaz sin implementación.
- `apps/mobile/src/features/goals/api/goals.api.ts` — **cada método enruta incondicionalmente al
  repositorio demo, sin importar si Demo Mode está activo o no**, con un comentario propio: _"Goal
  has no backend module yet... routes to the in-memory demo repository regardless of Demo Mode...
  Swap this for the isDemoModeActive() branch used by commitments.api.ts once that module ships."_
  Consecuencia práctica: **hoy, para cualquier usuario real (no solo en demo), los Goals viven
  únicamente en memoria de la sesión del navegador/app — no sobreviven ni un refresh.**

**Commitment, Task y Habit sí tienen backend**, y los tres comparten exactamente el mismo patrón
arquitectónico:

- Un repositorio en memoria (`InMemoryCommitmentRepository`, `InMemoryTaskRepository`, análogo
  para Habit) que almacena el **estado actual del agregado directamente** en un `Map<string,
Aggregate>`, más un `Map<string, number>` para versión.
- La versión se incrementa solo cuando el agregado tiene eventos no confirmados
  (`getUncommittedEvents().length`), sirviendo como control de **concurrencia optimista** — no
  como reconstrucción de estado a partir de eventos.
- Los eventos de dominio sí se generan y se despachan (vía `NestEventBusDispatcher`), pero
  únicamente para **efectos secundarios** (proyecciones de lectura, sagas, un log de actividad) —
  nunca para reconstruir el agregado. Si se borrara el store en memoria, los eventos despachados
  no permitirían reconstruir nada; no hay replay.

**Conclusión objetiva:** lo que existe hoy es CQRS parcial (separación command/query, handlers,
projectors, query services por agregado) **sin Event Sourcing real**. Es "CQRS con estado
versionado", no "Event Sourcing".

**Un Event Store completo ya existe en el código, pero no se usa.** `apps/backend/src/
infrastructure/event-store/in-memory-event-store.ts` implementa `saveEvents`/`getEvents` con
control de concurrencia optimista real (compara `expectedVersion` contra el número de eventos
almacenados). Está registrado como provider en `task.module.ts` y exportado — pero **ningún lugar
del código llama a `saveEvents()` ni a `getEvents()`** (verificado por búsqueda exhaustiva). El
único otro consumidor, `ProjectionLagIndicator` (health check), es explícitamente un mock: _"In a
real scenario, this would query EventStore version and ReadModel version... Here we mock it"_ —
`lag` está hardcodeado en `0`. Es infraestructura ya construida y nunca conectada.

---

## 2. Operaciones del dominio (inventario real, no hipotético)

| Agregado       | Comandos existentes (backend)                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Commitment** | register, activate, pause, resume, complete, cancel, edit (7)                                                                               |
| **Task**       | register, edit, complete, reopen, archive, restore, delete, duplicate, change-priority, quick-capture, relink-goal, relink-commitment (12)  |
| **Habit**      | register, edit, enable, disable, complete, uncomplete, archive, postpone, relink-goal (9)                                                   |
| **Goal**       | _(ninguno — sin backend)_. Métodos del agregado ya definidos en dominio: `rename`, `linkCommitment`, `linkHabit`, `complete`, `archive` (5) |

**¿Cada comando deja evidencia histórica?** No de forma uniforme. Solo **Commitment** tiene un
mecanismo de historial real: `ActivityLoggerHandler` escucha 9 de sus eventos de dominio
(Registered/Activated/Paused/Resumed/Completed/Cancelled/Renamed/DescriptionUpdated/Edited) y
los convierte en `ActivityRecord`s guardados en `InMemoryActivityRepository` — un log de solo
anexado, indexado por `commitmentId`, ordenado por fecha. **Esto ya funciona en el backend real
hoy** (es justamente lo que la app móvil no puede mostrar en modo demo por el gap ya registrado en
`TECH_DEBT.md` Item 33 — el backend SÍ lo tiene, el modo demo simplemente no lo replica). Task y
Habit no tienen ningún mecanismo equivalente — sus cambios de estado no dejan rastro alguno más
allá del estado actual.

---

## 3. Necesidades del producto (evidencia, no supuestos)

Buscado explícitamente, sin asumir que Event Sourcing es necesario para ninguna de estas:

- **Historial/Auditoría de Commitment:** ya existe y funciona en el backend, mediante un log de
  actividad dedicado — **no mediante Event Sourcing**. Es evidencia directa de que este tipo de
  necesidad ya se resolvió sin necesitar reconstrucción de estado desde eventos.
- **Timeline de Goal:** no existe ningún mecanismo hoy (ni siquiera parcial, porque Goal no tiene
  backend). Mencionado como capacidad deseada durante el cierre de VS-032 (Insights) — el
  `Historical/Analytics Engine`, candidato de roadmap aún sin numerar, documentado explícitamente
  como bloqueado por la falta de historial persistido (`TECH_DEBT.md`, hallazgo de Insights
  2026-07-16: _"almost everything Insights shows is computed live off current state... there's no
  persisted daily/event history"_).
- **Sincronización/Offline:** existe como ítem de roadmap ya numerado, **VS-035 — Offline First &
  Sync**, reservado pero no iniciado — es un requisito real y ya planeado, no hipotético, aunque
  todavía no comenzado.
- **Undo, reconstrucción de estado, resolución de conflictos offline, IA que explique progreso:**
  no se encontró ninguna evidencia de estos como requisitos activos del producto — ni en código,
  ni en `PROJECT_STATUS.md`, ni en `TECH_DEBT.md`, ni en el roadmap numerado. No se asumen como
  necesidades reales todavía.

---

## 4. Dolor técnico observado (no hipotético)

- **Volumen de boilerplate por agregado, medido:** Commitment tiene 64 archivos de backend para 7
  comandos; Task, 56 para 12; Habit, 41 para 9. Un solo comando requiere ~7 archivos (command,
  handler, nestjs-handler, result, dto, y 2 archivos de test) — confirmado contando los archivos
  reales de `register-commitment`. Replicar este patrón manualmente para Goal (5 métodos de
  dominio ya definidos) implicaría un orden de magnitud similar de archivos nuevos, sin ninguna
  infraestructura compartida que reduzca ese costo por agregado nuevo.
- **Deuda ya registrada y confirmada durante esta misma sesión (VS-037, Item 35):** dos archivos
  de test del backend están rotos por una generalización incompleta de `Reminder`
  (`commitmentId` → `sourceId`/`sourceType`) — evidencia directa de que extender un concepto ya
  existente a través de múltiples agregados (Commitment y, presumiblemente, Habit) ya generó
  fricción real y trabajo a medias, no solo hipotética.
- **No se encontró evidencia de:** queries lentas, transacciones complejas, o actualizaciones
  inconsistentes — no hay indicios de estos problemas en el código actual (repositorios en memoria
  triviales), aunque tampoco hay carga real de producción todavía que los revelaría.

---

## 5. Restricciones a considerar antes de evaluar alternativas

- **Todo backend existente (Commitment/Task/Habit) usa el mismo patrón** (estado versionado, sin
  Event Sourcing real). Cualquier decisión para Goal que se aparte de ese patrón crea dos
  arquitecturas de persistencia coexistiendo en el mismo backend — ya sea porque Goal adopta algo
  distinto, o porque se decide migrar los tres agregados existentes también.
- **Modo demo debe mantenerse en paridad funcional.** Cada capacidad nueva del backend real
  (incluyendo el propio historial de Commitment, ya con el gap conocido de Item 33) necesita su
  contraparte en el repositorio demo — este proyecto ya tiene evidencia repetida esta sesión de
  cuánto cuesta cuando esa paridad no se mantiene.
- **ADR-019 y ADR-020 no deben romperse.** Ninguna decisión de persistencia debe alterar el modelo
  de dominio visible (`Goal → Commitment → Task/Habit`) ni la filosofía de captura mínima —
  ambas son contratos de producto ya aprobados, independientes de cómo se persista el estado.
  Contraejemplo: si un actual `Commitment.register()` acepta un `Commitment` que puede existir sin
  Goal (comprobado en la investigación de ADR-019/Fase 2A), la migración a Goal debe preservar esa
  misma cardinalidad opcional.
- **Migración gradual, no un corte único.** Los 3 módulos existentes ya funcionan en producción
  (con datos demo, pero con la misma forma que tendrían datos reales) — cualquier cambio
  estructural que los afecte a los tres a la vez es una migración de mayor riesgo que construir
  Goal de forma aislada primero.
- **El Event Store ya construido y sin usar es un activo, no un compromiso.** Su existencia no
  obliga a usarlo — pero tampoco hay que "reinventarlo" si el análisis concluye que sí conviene
  Event Sourcing en algún punto; ya está escrito, probado en su propia lógica de concurrencia, solo
  nunca conectado.

---

## Observaciones clave

Sin emitir ninguna decisión — únicamente lo que la evidencia recopilada arriba demuestra:

1. **El problema inmediato es la ausencia total de backend para Goal**, no una limitación de CQRS
   ni de la estrategia de persistencia. El Aggregate existe en el dominio; el backend, no.
2. **El backend actual ya implementa CQRS parcial con éxito** (comandos, handlers, projectors,
   query services separados) para Commitment, Task y Habit — es un patrón probado, no
   experimental.
3. **El historial puede resolverse sin Event Sourcing** — el caso de Commitment (`ActivityLoggerHandler`
   → `ActivityRepository`) ya lo demuestra funcionando en producción. Cualquier propuesta de Event
   Store para resolver "necesitamos historial" debe justificarse con algo más que ese argumento,
   porque ese argumento específico ya tiene un contraejemplo funcional.
4. **El Event Store existente es infraestructura disponible, no una necesidad demostrada.** Está
   completo, probado en su propia lógica de concurrencia, y registrado en DI — pero nunca invocado.
   Su sola existencia no constituye evidencia de que haga falta usarlo.
5. **El mayor coste técnico medido y objetivo es la duplicación de infraestructura por agregado**
   (~7 archivos por comando, 41-64 archivos por módulo) — y es independiente de la estrategia de
   persistencia elegida. Adoptar Event Sourcing no lo resolvería por sí solo; seguiría habiendo
   commands, handlers, DTOs y tests por cada operación, a menos que la propia infraestructura
   compartida se rediseñe.

---

_Este documento no contiene ninguna decisión. El siguiente paso, según el proceso acordado, es
formular alternativas para **la persistencia y evolución del backend de Goal** — deliberadamente
no tituladas "CQRS/Event Store", para no presuponer que la respuesta involucra esa tecnología — y
evaluarlas contra esta evidencia, no al revés._
