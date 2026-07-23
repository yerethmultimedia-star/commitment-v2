# AR-024 — Límite de bounded context Goal→Commitment→Task nunca decidido

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas)

- **Dependencias:** Ninguna. Bloquea AR-025/AR-027. Owner=Ambos (requiere ADR).
- **Evidencia todavía válida:** el hallazgo es de la Architecture Review (It.3,
  `fase-1-nucleo/03-bounded-contexts.md`, 2026-07-20) — necesitaba reverificación, sobre todo porque
  **ADR-023** (Habit↔Commitment, decidida 2026-07-19 — un día antes de la propia auditoría) toca
  exactamente el mismo espacio de preguntas para `Habit`.
- **Impacto/Esfuerzo:** Alto/Medio, Riesgo Medio — empatada con AR-030/AR-047 en este tier; desbloquea
  2 ARs (AR-025, AR-027), más que las otras dos (1 cada una).

### Pregunta de framing que gobierna esta fase

> **¿Sigue sin decidirse el límite Goal→Commitment→Task, o parte de esa pregunta ya quedó resuelta —
> formal o informalmente — por decisiones posteriores a la auditoría (ADR-022, ADR-023)?**

### 1. Reproducción / verificación directa

**Hallazgo original** (`fase-1-nucleo/03-bounded-contexts.md`): `Task` tiene tanto `commitmentId:
CommitmentId | null` como `goalId: string | null` — puede vincularse a un Goal directamente, sin
Commitment intermedio. El comentario de `Goal.ts` afirma una "Hierarchy: Goal -> Commitment ->
Task/Habit" como si fuera una jerarquía asentada. La auditoría concluyó: _"Both readings are defensible
from the code; neither has been chosen."_

**Verificado hoy, directamente en el código:**

- `packages/domain/src/task/aggregate/Task.ts` — ambos campos siguen existiendo, sin cambios.
- **El código SÍ impone exclusión mutua entre ambos campos — confirmado leyendo `relinkGoal()`/
  `relinkCommitment()` directamente, no asumido desde un comentario:**
  ```
  relinkGoal(goalId): si goalId !== null, limpia commitmentId (emite TaskRelinkedToCommitmentEvent con commitmentId: null).
  relinkCommitment(commitmentId): si commitmentId !== null, limpia goalId (emite TaskRelinkedToGoalEvent con goalId: null).
  ```
  El comentario del propio método lo dice explícitamente: _"A task's Goal and Commitment links are
  mutually exclusive — linking to a Goal directly clears any existing Commitment link, since the Goal
  would otherwise be ambiguous."_
- **Verificado por `git log` que este comportamiento no es nuevo ni posterior a la auditoría — ya
  existía antes de que se auditara:** el commit `1ead830` (_"feat(task): implement ADR-022 Task
  Lifecycle & Execution Model"_) introdujo `relinkGoal`/`relinkCommitment` con esta exclusión mutua el
  **2026-07-18**, dos días antes de que la Architecture Review (2026-07-20) describiera el campo doble
  como "ambiguo, ninguna lectura descartada." La auditoría verificó que ambos campos existían, pero no
  verificó si el código los trataba como excluyentes — un caso de auditoría incompleta, no de código
  que cambió después.
- **`docs/03-architecture/adr_022_task_lifecycle_and_execution_model.md` §2** confirma `Task.
commitmentId` como opcional ("Task huérfana... es un caso válido") pero **no menciona `goalId` ni la
  exclusión mutua en absoluto** — el ADR no discute esta relación como una decisión de límite de
  contexto, aunque el código que introdujo (mismo commit) sí la implementa.
- **`packages/domain/src/goal/aggregate/Goal.ts` (comentario de cabecera, sin cambios desde la
  auditoría):** _"Hierarchy: Goal -> Commitment -> Task/Habit, plus Goal -> Habit/Milestone directly."_
  Sigue sin mencionar que `Task` también tiene un enlace directo a `Goal` — el mismo lenguaje
  "jerarquía estricta" que la Recomendación #1 de la auditoría original pidió explícitamente retirar
  por engañoso, sigue intacto.
- **`docs/03-architecture/adr_023_habit_commitment_relationship.md` (decidida 2026-07-19, un día antes
  de la auditoría):** resuelve la pregunta análoga para `Habit` — asociación débil con `Commitment`
  (`commitmentIds: string[]`, sin ownership ni cascadas), mientras mantiene su relación primaria y
  exclusiva con `Goal` (`goalId`, sin cambios). **Esta ADR cita explícitamente la exclusión mutua de
  `Task` como precedente y contraste** para justificar por qué `Habit` se decide distinto: _"Task.
  goalId/Task.commitmentId son mutuamente excluyentes porque una Task existe para un plan concreto...
  Un Habit no tiene esa naturaleza de pertenencia única."_ — es decir, ADR-023 **asume como ya
  establecido** el comportamiento de `Task`, sin haberlo decidido ella misma ni citar una ADR que lo
  haya hecho.

### Respuesta a la pregunta de framing

> **El hallazgo quedó parcialmente resuelto — en la práctica, no en la documentación.** El límite
> Goal→Commitment→Task **sí tiene una respuesta operativa, real y anterior a la propia auditoría**: el
> dominio impone que un `Task` pertenece a un plan — o bien un `Goal` directamente, o bien la ejecución
> de un `Commitment` específico, nunca ambos — exactamente la Alternativa (a) que la auditoría original
> ya recomendaba ("declarar Planning & Execution un bounded context / shared kernel, documentar que el
> enlace directo Task→Goal es intencional"). Pero **ninguna ADR lo registra como decisión**, y el
> comentario de `Goal.ts` sigue usando el lenguaje de "jerarquía estricta" que la propia auditoría pidió
> retirar por engañoso. ADR-023 ya trata la exclusión de `Task` como un hecho dado, sin haberla decidido
> — construye sobre una base no formalizada.

**Consecuencia para el alcance de AR-024:** se reduce significativamente. No es _"decidir si Task viola
el límite o si Planning & Execution es un shared kernel"_ — el sistema ya se comporta según esa segunda
lectura, de forma consistente y verificada. El alcance real es **formalizar en una ADR una decisión que
el código ya implementa**, y **corregir el comentario de `Goal.ts`** para que deje de describir una
jerarquía estricta que el propio código nunca ha respetado. Esto es sustancialmente más barato que un
rediseño de límites — es documentación de una decisión ya operativa, con el mismo espíritu que ADR-023
ya demostró para el caso de `Habit`.

---

## Estado

**Fase 1 cerrada.** El hallazgo original describía una decisión de límite de contexto sin tomar. La
evidencia muestra que **la decisión ya está tomada e implementada en código desde antes de la propia
auditoría** (exclusión mutua Goal/Commitment en `Task`, `commit 1ead830`, 2026-07-18) — solo falta
formalizarla en una ADR y corregir el comentario de `Goal.ts` que sigue describiendo una jerarquía
estricta ya contradicha por el propio dominio. ADR-023 (Habit↔Commitment) ya construyó sobre esta
exclusión sin haberla decidido ella misma, evidencia adicional de que la ausencia de una ADR dedicada es
el problema real, no la ausencia de una decisión. Estado: ⬜ → 🟦 En análisis. Decisión: pendiente Fase
2A (Owner=Ambos — requiere el juicio del usuario sobre si formalizar la exclusión mutua ya operativa es
la decisión correcta, o si la evidencia amerita reabrir la pregunta de fondo).
