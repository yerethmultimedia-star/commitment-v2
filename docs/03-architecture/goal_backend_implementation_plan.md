# Goal Backend Implementation Plan

**Estado:** Documento de diseño técnico (no una ADR). Transforma la decisión ya tomada en
`adr_021_goal_backend_and_domain_history_infrastructure.md` en un plan de ejecución ordenado y
verificable. No vuelve a discutir arquitectura — cada sección se basa en leer directamente la
implementación real de Commitment (el módulo de referencia que ADR-021 decidió espejar), no en
diseño desde cero.

---

## 1. Estructura del módulo

`apps/backend/src/goal/`, mirroring exactamente la forma de `apps/backend/src/commitment/`
(64 archivos hoy, la implementación más completa de las tres existentes):

```text
goal/
├── api/
│   ├── goals.controller.ts
│   └── dtos/
│       ├── register-goal.dto.ts
│       └── edit-goal.dto.ts          (rename + description, si aplica)
├── application/
│   ├── commands/
│   │   ├── register-goal.{command,handler,result}.ts
│   │   ├── rename-goal.{command,handler,result}.ts
│   │   ├── link-commitment-goal.{command,handler,result}.ts
│   │   ├── link-habit-goal.{command,handler,result}.ts
│   │   ├── complete-goal.{command,handler,result}.ts
│   │   └── archive-goal.{command,handler,result}.ts
│   ├── queries/
│   │   ├── goal-view.dto.ts
│   │   ├── get-goal-by-id.{query,handler}.ts
│   │   └── list-goals.{query,handler}.ts
│   ├── ports/
│   │   ├── versioned-goal-repository.port.ts
│   │   ├── goal-query-service.port.ts
│   │   └── domain-event-dispatcher.port.ts   (reutilizable tal cual, no específico de Commitment)
│   └── projectors/
│       └── goal.projectors.ts
├── infrastructure/
│   ├── in-memory-goal.repository.ts
│   ├── in-memory-goal-projection.store.ts
│   ├── in-memory-goal.query-service.ts
│   └── nest-event-bus.dispatcher.ts          (reutilizable, no específico de Commitment)
├── nestjs/
│   └── *.nestjs-handler.ts (uno por comando + queries)
└── goal.module.ts
```

**No incluido en esta primera versión, deliberadamente:** sagas (Commitment tiene
`RecurringCommitmentSaga` porque los Commitments recurren; Goal no tiene ese concepto —
`ArchiveHabitSaga`-style automation no aplica sin evidencia de necesidad), `next-occurrence`-style
calculators (mismo motivo).

---

## 2. Mapa de comandos

Derivado directamente de los métodos públicos de mutación ya definidos en
`packages/domain/src/goal/aggregate/goal.ts` — verificado, no se falta ninguno:

| Comando          | Método de dominio               | Firma real del agregado                                                         |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `RegisterGoal`   | `Goal.register()`               | `(id, identityId, title, description)` — description es el único campo opcional |
| `RenameGoal`     | `.rename(newTitle)`             |                                                                                 |
| `LinkCommitment` | `.linkCommitment(commitmentId)` |                                                                                 |
| `LinkHabit`      | `.linkHabit(habitId)`           |                                                                                 |
| `CompleteGoal`   | `.complete()`                   |                                                                                 |
| `ArchiveGoal`    | `.archive()`                    |                                                                                 |

`Goal.register()` solo exige `identityId` y `title` — description es opcional, igual que
`Commitment.register()` (confirmado en la investigación de ADR-019/Fase 2A) — consistente con el
principio de captura mínima de ADR-020, sin cambios necesarios ahí.

**No hay comando de edición combinado** (`EditGoal` tipo Commitment's `edit-commitment`, que
agrupa varios campos en un solo comando) — el agregado no expone un método `edit()` genérico,
solo mutaciones específicas (`rename`, etc.). Mirroring el agregado tal como está definido, no se
introduce un comando compuesto que el dominio no modela.

---

## 3. Proyecciones — un solo `GoalView`, no Summary/Detail separados

Verificado, no asumido: **Commitment no distingue Summary de Detail.** Su único read model,
`CommitmentView` (`commitment-view.dto.ts`), es una forma plana que sirve tanto para `findById`
como para `findAll` — los projectors mantienen una sola vista por agregado, actualizada por
evento. El propio `demo-goals.repository.ts` (la implementación que la app móvil ya consume hoy)
confirma el mismo patrón para Goal: `list()` y `getById()` devuelven exactamente la misma forma
(`withProgress(goal)`), sin una versión "resumida" distinta.

**Ajuste respecto a la propuesta original (GoalSummary + GoalDetail):** con esta evidencia, la
versión inicial debería ser **un solo `GoalView`**, mirroring el patrón real de Commitment en vez
de introducir una distinción que ni el módulo de referencia ni el consumidor móvil actual usan.
Separar Summary/Detail más adelante sigue siendo posible si aparece una necesidad real (p. ej. si
`GoalView` crece con datos costosos de calcular en cada `list()`), pero no hay evidencia de esa
necesidad hoy — introducirla ahora repetiría el mismo error que el Assessment ya señaló para
Event Store (construir para una necesidad no demostrada).

```ts
export type GoalView = {
  id: string;
  identityId: string;
  title: string;
  description: string | null;
  state: string; // 'Draft' | 'Active' | 'Completed' | 'Archived' (confirmar contra GoalState real)
  version: number;
  commitmentIds: string[];
  habitIds: string[];
};
```

---

## 4. Historial — orden exacto de operaciones

Leído directamente de `register-commitment.handler.ts` (el patrón real, no descrito de memoria) —
el handler ya numera sus propios pasos:

```text
1. Idempotency check (findById; si ya existe, no reincrementa versión — Rule #87)
2. Traducir primitivos → Value Objects
3. Invocar el comportamiento del Aggregate (genera eventos internamente, sin persistir todavía)
4. repository.save(aggregate)              → persiste estado actual, retorna versión
5. eventDispatcher.dispatch(events)         → efectos secundarios (hoy: projectors)
   aggregate.clearUncommittedEvents()
```

**Punto exacto de inserción para ADR-021's infraestructura de historial**, precisando la
secuencia que propuso el usuario (`Persist Current State → Persist Domain Events → Publish Domain
Events`):

```text
1. Idempotency check
2. Traducir primitivos → Value Objects
3. Invocar el comportamiento del Aggregate
4. repository.save(aggregate)                    → estado actual (sin cambios, sigue siendo la fuente de verdad)
5. eventStore.saveEvents(streamId, expectedVersion, events)   → NUEVO: bitácora duradera
6. eventDispatcher.dispatch(events)              → efectos secundarios (projectors, y ahora también
                                                     un GoalHistoryProjector, análogo a ActivityLoggerHandler)
   aggregate.clearUncommittedEvents()
```

El paso 5 es puramente aditivo — no reemplaza el paso 4 (que sigue siendo la fuente de verdad,
sin cambios), y usa `expectedVersion` = la versión retornada por el paso 4, aprovechando
exactamente el control de concurrencia optimista que `InMemoryEventStore` ya implementa. **Una
falla al persistir el historial (paso 5) no invalida la persistencia del agregado (paso 4) ni
compromete la fuente de verdad definida por ADR-021** — esa garantía sí se sostiene. Lo que no se
sostiene automáticamente es la completitud del historial: si el paso 5 falla, el agregado queda
correctamente persistido pero ese evento específico no queda en la bitácora, dejando el historial
parcial para ese agregado. La recuperación o reintento del historial ante esa falla es una
consideración operativa independiente, no resuelta por este documento.

**`GoalHistoryProjector`** (nombre propuesto, análogo a `ActivityLoggerHandler`): escucha los
eventos de Goal, y en vez de escribir directamente a un `ActivityRepository` específico de Goal,
consulta al Event Store ya poblado por el paso 5 — la única pieza genuinamente nueva de
infraestructura, reutilizable después por cualquier otro agregado que decida generalizar su
propio historial (explícitamente no forzado por ADR-021).

---

## 5. Integración móvil — punto exacto de cambio

**Antes** (`apps/mobile/src/features/goals/api/goals.api.ts`, estado actual, leído del código):

```ts
// Cada método enruta incondicionalmente al repositorio demo — sin importar Demo Mode.
export const goalsApi = {
  list: async () => demoGoalsRepository.list(),
  getById: async (id: string) => demoGoalsRepository.getById(id),
  create: async (payload: CreateGoalPayload) => demoGoalsRepository.create(payload),
  toggleMilestone: async (id: string) => demoGoalsRepository.toggleMilestone(id),
};
```

**Después** — el propio comentario del archivo ya indica el objetivo: _"Swap this for the
isDemoModeActive() branch used by commitments.api.ts once that module ships."_ Mirroring
exactamente `commitments.api.ts`:

```ts
export const goalsApi = {
  list: async (signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoGoalsRepository.list();
    return apiClient.get('goals', { signal }).json<{ items: GoalView[]; total: number }>();
  },
  getById: async (id: string, signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoGoalsRepository.getById(id);
    return apiClient.get(`goals/${id}`, { signal }).json<GoalView>();
  },
  create: async (payload: CreateGoalPayload) => {
    if (isDemoModeActive()) return demoGoalsRepository.create(payload);
    return apiClient.post('goals', { json: payload }).json<{ goalId: string }>();
  },
  // toggleMilestone permanece sin equivalente en el backend real — ver
  // resolución abajo. Sigue enrutando solo a demoGoalsRepository, sin rama
  // isDemoModeActive(), hasta que Milestone se modele como parte del dominio.
  toggleMilestone: async (id: string) => demoGoalsRepository.toggleMilestone(id),
};
```

**Discrepancia `toggleMilestone` — resuelta, no inventada.** `packages/domain/src/goal/models/
milestone.model.ts` es explícito: _"Plain read-model shape, not a DDD aggregate... has no
independent lifecycle worth modeling as an aggregate yet."_ El propio `Goal` aggregate lo confirma
en su comentario de cabecera: _"Milestone is intentionally not modeled yet (see Phase 5 — Goals
Workspace); linkCommitment/linkHabit are the only relationships this phase needs."_ No es un
desajuste de nombres ni una mutación indebida de estructura interna — es una pieza de dominio
deliberadamente diferida, ya documentada como tal antes de este plan.

**Resolución: `toggleMilestone` queda explícitamente fuera de Fase 1.** No se inventa un comando
`ToggleMilestone` para satisfacer la API existente — eso repetiría exactamente el error que el
Assessment ya señaló (construir para una necesidad no confirmada por el dominio). `goalsApi.
toggleMilestone` sigue enrutando únicamente al repositorio demo, sin rama `isDemoModeActive()`,
hasta que exista una decisión explícita sobre cómo modelar Milestone (¿aggregate propio? ¿método
en `Goal`? — no decidido aquí). Registrado como brecha conocida, no bloqueante para Fase 1.

---

## 6. Estrategia de implementación — fases pequeñas, mismo ritmo que ADR-019/ADR-020

1. **Fase 1 — Backend mínimo.** Módulo `goal/`, comandos `RegisterGoal`/`RenameGoal`/
   `CompleteGoal`/`ArchiveGoal` (los que no dependen de otro agregado), repositorio versionado,
   sin Event Store todavía. Objetivo: Goal persiste y sobrevive un reload — el problema #1 del
   Assessment, resuelto primero, aislado del resto.
2. **Fase 2 — Query services y read model.** `GoalView` único (sección 3), `list`/`getById`
   funcionando contra el backend real.
3. **Fase 3 — Comandos de relación.** `LinkCommitment`/`LinkHabit` — dependen de que Commitment/
   Habit ya puedan referenciar un `goalId` real (ya lo hacen desde ADR-019/Fase 2A del lado
   Commitment; confirmar el lado Habit antes de esta fase).
4. **Fase 4 — Event Store + historial.** Conectar `InMemoryEventStore` (sección 4),
   `GoalHistoryProjector`. Explícitamente después de que el CRUD básico ya esté probado — no
   bloquea las fases 1-3.
5. **Fase 5 — Integración móvil.** `goals.api.ts` (sección 5), resolver la brecha de
   `toggleMilestone`.
6. **Fase 6 — Golden Path + cierre.** Nuevo Golden Path (`golden_path_goal_creation.md`, ya
   nombrado como placeholder en `docs/07-quality/golden_path_coverage.md`) siguiendo la misma
   disciplina que validó Fase 2A de ADR-019 — no declarar el módulo completo hasta que corra
   limpio.

Cada fase es funcional de forma aislada — Fase 1 por sí sola ya resuelve el problema más urgente
del Assessment, sin esperar a las fases 4-6.

---

_Este documento no contiene decisiones de arquitectura nuevas — todo lo aquí escrito deriva de
ADR-021 y de la implementación real de Commitment. Dos ajustes respecto a las preguntas originales
quedaron documentados con evidencia: sección 3 (un `GoalView` en vez de Summary/Detail separados)
y sección 5 (`toggleMilestone` queda fuera de Fase 1 — el dominio ya documenta a Milestone como
deliberadamente no modelado, resuelto sin inventar un comando nuevo)._
