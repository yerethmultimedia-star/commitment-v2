# Goal View Alignment Assessment

**Estado:** Investigación (no una ADR). Encontrada durante la revisión de integración previa a
ADR-021 Fase 4 (2026-07-17) — antes de escribir código de integración móvil, esta investigación
responde una pregunta más fundamental: ¿cuál es el modelo canónico de `Goal` que la aplicación
pretende soportar? Hasta responderla, sustituir `demoGoalsRepository` por el backend real sería un
parche, no una integración.

---

## 1. El hallazgo

`GoalWorkspaceScreen.tsx`, `GoalCard.tsx` y `useGoalFocus` (Coach insight) consumen un modelo de
`Goal` con estos campos: `category`, `priority`, `progress`, `milestones[]`, `targetDate`. Ninguno
de los cinco existe en el `GoalView` real (`apps/backend/src/goal/application/queries/
goal-view.dto.ts`), que solo expone `id`, `identityId`, `title`, `description`, `state`, `version`,
`commitmentIds[]`, `habitIds[]`, `completedAt`.

No son variantes de un mismo DTO con nombres distintos — son dos modelos distintos, que
evolucionaron por separado: el backend siguiendo estrictamente el agregado de dominio (ADR-021,
Fases 1-3), la UI siguiendo lo que las pantallas de Goals Workspace necesitaron mostrar (Phase 5,
antes de que existiera un backend real).

---

## 2. Metodología

Para cada campo divergente se responde una única pregunta: **¿pertenece al agregado `Goal`, o es
otra cosa (presentación, dato derivado, o un concepto que pertenece a otro agregado todavía no
construido)?** La evidencia se toma del código existente, no de una preferencia — en varios casos
el propio código ya contiene la respuesta.

---

## 3. Campo por campo

### `category`

- **Evidencia:** No aparece en `packages/domain/src/goal/aggregate/goal.ts` bajo ninguna forma. No
  aparece en ADR-019 (el documento que define el modelo de dominio Goal→Commitment→Task/Habit). En
  `GoalsScreen.tsx` no hay ningún filtro, orden, ni regla que lo use — solo se renderiza como texto/
  badge en `GoalCard.tsx` y `GoalWorkspaceScreen.tsx`. `DEMO_DATASET.md` lo documenta como una
  columna de "The 7 Goals" — una tabla de contenido de ejemplo, no una decisión de dominio.
- **Conclusión:** Es una etiqueta de presentación/organización visual, no un concepto de dominio.
  Nunca fue decidido — apareció directamente en el dataset demo.
- **Acción recomendada:** No agregar a `GoalView`. Si el producto quiere categorías de Goal como
  concepto real (filtrado, agrupación, analítica), eso requiere su propia decisión de producto
  primero — no se resuelve agregando un campo string al DTO.

### `priority`

- **Evidencia:** No existe en el agregado `Goal`, no aparece en ADR-019. Importante: esto es
  distinto de `CommitmentPriority`, que sí es un Value Object real en el dominio de Commitment, con
  soporte de backend completo. El `priority` de Goal en el demo dataset es un campo homónimo pero
  sin ninguna relación con ese concepto.
- **Corrección (2026-07-18, encontrada durante la implementación de Fase 4, no durante esta
  investigación original):** la conclusión inicial ("presentación pura") estaba incompleta —
  `useDashboardContext.ts` (Dashboard, "Priority of the Day") sí consume `goal.priority` con efecto
  real: un bonus de scoring (`goalBonus: high=5/medium=2/low=0`) que influye en qué tarea se
  destaca como prioritaria del día. No se encontró antes porque la búsqueda original cubrió Goals
  Workspace, no Dashboard.
- **Conclusión revisada:** tiene un consumidor funcional real, pero eso no lo convierte en un
  atributo de dominio. La pregunta correcta no es "¿algo lo usa?" sino "¿participa en las
  invariantes del agregado?" — comandos, eventos, transiciones de estado, consistencia. `priority`
  no participa en ninguna de esas cosas; afecta únicamente un algoritmo de ranking en la capa de
  presentación del Dashboard. Un Goal con prioridad alta cuya única consecuencia sea que el
  Dashboard muestre antes una tarea sigue sin ser un concepto de dominio.
- **Acción tomada:** no agregar `priority` a `GoalView`. Se eliminó el `goalBonus` de
  `useDashboardContext.ts` (queda en 0 para todo Goal, documentado explícitamente en el código como
  decisión consciente, no como omisión) — el ranking sigue funcionando solo con `task.priority` +
  `activeCommitmentBonus`. Si en el futuro el producto decide que la prioridad de un Goal representa
  una decisión de negocio real (afecta planificación, notificaciones, reglas), esa sería una
  evolución del dominio a evaluar por separado, probablemente vía ADR — no parte de esta fase.

### `progress`

- **Evidencia — la más concluyente de las cuatro.** `packages/domain/src/goal/engine/
compute-goal-progress.ts` ya existe, y su propio comentario dice textualmente: _"a Goal's progress
  is never a stored/hardcoded number... so any caller (mobile demo adapter today, **a real backend
  query later**) can feed it real data without this function changing."_ Esto no es una opinión de
  esta investigación — es una decisión de diseño que ya estaba tomada cuando se escribió esa función
  (antes de esta sesión), simplemente nunca conectada al backend real. `progress` no debe
  persistirse; se calcula a partir de `commitmentProgressRatios` + `milestones`.
- **Conclusión:** Derivado, por diseño explícito y preexistente. No pertenece a `GoalView` como
  campo almacenado — pertenece a la capa de query.
- **Acción recomendada:** Cuando llegue el momento de conectar Goal real a la UI, calcular
  `progress` en el query service (`InMemoryGoalQueryService` o un servicio de composición que cruce
  Goal/Commitment/Habit), reutilizando `computeGoalProgress()` tal cual existe. No es trabajo de
  Fase 4 todavía — depende de que las queries de Commitment/Habit-por-Goal existan del lado real
  (hoy no hay un query real "progreso de Commitment" expuesto que Goal pueda consumir).

### `targetDate` (no estaba en la tabla original, encontrado durante esta revisión)

- **Evidencia:** El agregado `Goal` tampoco tiene `targetDate` como campo propio. El propio
  `demoGoalsRepository.deriveTargetDate()` ya lo calcula: _"Latest target date among a Goal's linked
  commitments — never a separately invented date."_ Mismo patrón exacto que `progress`.
- **Conclusión:** Derivado, igual que `progress` — la última `targetDate` entre los Commitments
  enlazados. No hace falta ninguna decisión nueva; ya está resuelto en el demo, solo falta el
  equivalente real.
- **Acción recomendada:** Igual que `progress` — cálculo en la capa de query cuando exista consumo
  cruzado de Commitment desde Goal, no un campo en `GoalView`.

### `milestones[]`

- **Evidencia — el caso más delicado.** `packages/domain/src/goal/models/milestone.model.ts` es
  explícito: _"Plain read-model shape, not a DDD aggregate... has no independent lifecycle worth
  modeling as an aggregate yet."_ Y el agregado `Goal` mismo documenta: _"Milestone is intentionally
  not modeled yet (see Phase 5 — Goals Workspace); linkCommitment/linkHabit are the only
  relationships this phase needs."_ Ese comentario está desactualizado — Phase 5 (Goals Workspace)
  ya está construida en móvil, con Milestones como concepto demo-only, pero el backend nunca hizo el
  seguimiento. `toggleMilestone` (el mutation hook ya existente) no tiene ningún comando backend
  equivalente, por diseño — confirmado en la investigación previa de ADR-021 (Fase 1).
- **Conclusión:** Este no es un campo derivado como `progress`/`targetDate` — es un concepto de
  dominio real (checkpoints con estado propio, mutable, con ciclo de vida) que simplemente nunca fue
  modelado en el backend. La UI se apoya en un concepto que el backend no tiene, no en un problema de
  adaptador.
- **Acción recomendada:** Requiere una decisión de producto/dominio explícita, no una extensión
  mecánica de `GoalView`. Preguntas a resolver antes de escribir código: ¿Milestone se convierte en
  una entidad con comandos propios (`AddMilestone`/`ToggleMilestone`/`RemoveMilestone`) dentro del
  agregado `Goal`, similar a cómo `linkCommitment`/`linkHabit` ya funcionan? ¿O sigue siendo
  puramente de presentación y `toggleMilestone` se elimina de la UI real? Esto bloquea la migración
  completa de `GoalWorkspaceScreen.tsx`, no bloquea el resto de Fase 4.

---

## 4. Tabla resumen

| Campo             | Demo           | Backend | Canónico                                                       | Acción                                                                                     |
| ----------------- | -------------- | ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `title`           | ✅             | ✅      | ✅                                                             | ninguna                                                                                    |
| `description`     | ✅             | ✅      | ✅                                                             | ninguna                                                                                    |
| `state`           | ✅             | ✅      | ✅                                                             | ninguna                                                                                    |
| `commitmentIds[]` | ❌ (implícito) | ✅      | ✅                                                             | adaptar UI (ya listo del lado backend)                                                     |
| `habitIds[]`      | ❌ (implícito) | ✅      | ✅                                                             | adaptar UI (ya listo del lado backend)                                                     |
| `completedAt`     | ✅             | ✅      | ✅                                                             | ninguna                                                                                    |
| `category`        | ✅             | ❌      | presentación, no dominio                                       | no agregar a `GoalView`                                                                    |
| `priority`        | ✅             | ❌      | consumidor funcional real (Dashboard ranking), pero no dominio | no agregar a `GoalView`; bonus removido de Dashboard, documentado como decisión consciente |
| `progress`        | ✅ (calculado) | ❌      | derivado (ya confirmado en el código)                          | calcular en la capa de query, no persistir                                                 |
| `targetDate`      | ✅ (calculado) | ❌      | derivado (mismo patrón que `progress`)                         | calcular en la capa de query, no persistir                                                 |
| `milestones[]`    | ✅             | ❌      | dominio real, no modelado                                      | decisión de producto pendiente — bloquea solo esta parte                                   |

---

## 5. Qué desbloquea esto para Fase 4

Con esta tabla, la mayor parte de Fase 4 deja de estar bloqueada:

- `title`/`description`/`state`/`completedAt`/`commitmentIds`/`habitIds` pueden mapearse
  directamente hoy — mismo trabajo mecánico que Commitment/Habit ya hicieron.
- `category`/`priority` se eliminan de la UI real. `priority` tenía un consumidor funcional
  (Dashboard ranking, ver corrección arriba) — removido explícitamente, no silenciado.
- `progress`/`targetDate` quedan pendientes de un query cruzado Goal↔Commitment que hoy no existe
  del lado real — acotado, no bloqueante para el resto de los campos.
- `milestones[]`/`toggleMilestone` es el único punto que requiere una decisión explícita antes de
  tocar código — y es aislable: bloquea solo esa sección de `GoalWorkspaceScreen.tsx`, no el resto
  de la pantalla ni el resto de Fase 4.

**Corrección (2026-07-18, durante la implementación):** el punto de `progress`/`targetDate` arriba
resultó ser menos bloqueante de lo estimado. `GoalWorkspaceScreen.tsx` y `ObjectivesTab.tsx` ya
llaman a `useCommitments()`/`useTasks()` (que en modo real ya traen `commitmentId`, `status`,
`targetDate` por Task/Commitment) — no hace falta ningún query nuevo del lado backend.
`computeGoalProgress()` (la función pura de dominio) se invoca en una capa de composición móvil
(`useGoalsView()`/`useGoalWorkspace()`, ver `compose-goal-view.ts`) que cruza `GoalSummary` con los
datos de Commitment/Task ya obtenidos por hooks existentes — idéntico cálculo para Demo y Backend
Mode, sin bifurcación por modo salvo en Milestones (que no tiene datos reales todavía).

---

## 6. No resuelto por este documento

- Si `category`/`priority` deberían existir como concepto de producto en algún momento (no como
  parche de compilación) — explícitamente fuera de alcance aquí, es una decisión de producto
  separada.
- El diseño exacto de Milestone como entidad de dominio (si se decide modelarla) — este documento
  identifica la pregunta, no la responde.
- El bug de `commitmentsApi.create()` (`TECH_DEBT.md` Item 40) — relacionado por haber aparecido en
  la misma revisión, pero es un defecto de implementación, no una cuestión de alineación de modelo.
