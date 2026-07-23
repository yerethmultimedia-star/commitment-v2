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

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

AR-024 presenta un patrón distinto a AR-002/AR-009/AR-036/AR-004: no es que la decisión aún deba
tomarse, ni que la documentación se haya desalineado de una decisión existente — **la decisión ya
existe en el sistema, pero carece de formalización arquitectónica.**

**H1 (principal):** _"La exclusión mutua entre `goalId` y `commitmentId` constituye una decisión
arquitectónica ya implementada y utilizada como precedente por otras decisiones, pero no formalizada
mediante una ADR. La remediación consiste en hacer explícita esa decisión y alinear la documentación
residual."_ Respaldada por la evidencia de Fase 1: la regla existe en código desde antes de la
auditoría; la auditoría inspeccionó la estructura de datos, no el comportamiento; ADR-023 ya depende
implícitamente de esa regla; persiste una única inconsistencia documental (`Goal.ts`).

**Hipótesis alternativas descartadas:**

- **H2** — la decisión aún debe diseñarse. Descartada: el comportamiento ya está implementado y
  estable; rediseñarlo implicaría reabrir una decisión que el sistema ya tomó de facto.
- **H3** — el problema es únicamente un comentario incorrecto. Descartada: el comentario es un
  síntoma — el problema real es la ausencia de una decisión arquitectónica explícita que explique por
  qué el código funciona así y permita que otras ADR la referencien correctamente.
- **H4** — ADR-023 formalizó implícitamente esta decisión. Descartada: la evidencia muestra lo
  contrario — ADR-023 utiliza la exclusión como antecedente, pero no la crea; una ADR no debería
  adquirir autoridad retrospectiva sobre una decisión distinta simplemente porque la menciona.

**H1 sobrevive.** El objeto de AR-024 ya no es definir un límite de dominio — es cerrar la brecha entre
una decisión operativa y su trazabilidad arquitectónica.

## Fase 2B — Decisión

**Estado: ✅ Decisión aprobada.**

No se vuelve a decidir la exclusión mutua — esa decisión ya está materializada. La propiedad
arquitectónica congelada es otra.

**D-024.1:** _"Toda restricción de dominio que condicione la interpretación del modelo y sirva de
fundamento para decisiones arquitectónicas posteriores debe estar formalizada mediante una ADR o un
artefacto arquitectónico equivalente, de forma que su existencia no dependa exclusivamente de la
implementación."_

**No dice** "Goal y Commitment son excluyentes" — eso ya lo demuestra el código. Establece una
propiedad de gobernanza arquitectónica: las decisiones fundamentales del dominio deben ser
explícitamente trazables. Mismo patrón que D-002.1/D-009.1/D-036.1/D-004.1/D-043.1/D-054.1/D-044.1-3.

**Aspecto a vigilar en Fase 4A, registrado de antemano:** no convertir esta AR en una revisión del
modelo Goal-Commitment-Task — ese modelo ya mostró estabilidad. El diseño debe centrarse en responder:
_"¿cuál es el mejor mecanismo para convertir una decisión ya operativa en una decisión arquitectónica
explícita, sin reescribir la historia del proyecto?"_ La respuesta probablemente implica una ADR
retrospectiva (mismo patrón que AR-001), corrección del comentario de `Goal.ts`, y actualización de
referencias arquitectónicas necesarias — pero eso pertenece al diseño, no a esta decisión.

---

## Estado

**Fase 1, Fase 2A y Fase 2B cerradas.** El hallazgo original describía una decisión de límite de
contexto sin tomar. La evidencia muestra que la decisión ya está tomada e implementada en código desde
antes de la propia auditoría. Reencuadrado por la evidencia: no es diseñar un límite, es cerrar la
brecha entre una decisión operativa y su trazabilidad arquitectónica. D-024.1 aprobada: toda restricción
de dominio que sirva de fundamento para decisiones posteriores debe estar formalizada mediante una ADR,
sin depender solo de la implementación — formulada como propiedad de gobernanza, sin mecanismo
concreto. Pendiente: **Fase 4A (Diseño técnico)** — con la precaución explícita de no reabrir el modelo
Goal-Commitment-Task ya estable. Estado: se mantiene 🟦 En análisis (no salta a 🟨 hasta Fase 4B).
Decisión: 💭 → ✅ Decisión aprobada.
