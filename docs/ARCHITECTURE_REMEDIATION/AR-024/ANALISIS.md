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

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

**Pregunta que gobierna esta fase (distinta a un diseño de dominio):** _"¿Cómo debe incorporarse una
decisión ya consolidada al corpus arquitectónico sin alterar la historia del proyecto?"_

### Alternativas evaluadas

- **A — Crear una ADR normativa nueva (sin marcarla retrospectiva).** Descartada: transmitiría que la
  decisión nace ahora, cuando existía antes de la auditoría, estaba implementada, y ya servía de
  fundamento para ADR-023 — cronológicamente inexacta.
- **B — Modificar ADR-023 para que absorba la decisión.** Descartada: ADR-023 depende de esta decisión,
  no debe convertirse retrospectivamente en su origen — rompería la trazabilidad causal.
- **C — Documentar únicamente el comentario de `Goal.ts`.** Descartada: corrige un síntoma, no resuelve
  la ausencia de una decisión explícita que otras ADR puedan referenciar.
- **D — ADR retrospectiva + alineación documental (elegida).** 3 responsabilidades diferenciadas: ADR
  retrospectiva (formaliza una decisión que ya existía), código (permanece sin cambios funcionales),
  documentación residual (elimina contradicciones, como el comentario de `Goal.ts`).

### Diseño congelado

> **Las decisiones arquitectónicas descubiertas retrospectivamente se formalizan mediante una ADR
> explícitamente retrospectiva, preservando la cronología real de implementación, sin introducir
> cambios funcionales y corrigiendo únicamente la documentación que contradiga la decisión ya vigente.**

**Trazabilidad:** la nueva ADR documenta la decisión; ADR-023 pasa a referenciarla como fundamento
explícito, sin que su contenido técnico cambie.

### Alcance fijado para Fase 4B

- Creación de la ADR retrospectiva.
- Corrección del comentario de `Goal.ts`.
- Actualización de referencias cruzadas necesarias (ADR-023).
- **Ninguna modificación del comportamiento del dominio.** Si apareciera la necesidad de cambiar
  código funcional, sería señal de que la evidencia de Fase 1 se interpretó incorrectamente.

### Criterio de validación para Fase 5 (trazabilidad, no comportamiento)

1. ¿La decisión implementada tiene ahora una ADR que la formaliza explícitamente?
2. ¿La ADR preserva la cronología real en lugar de reescribirla?
3. ¿ADR-023 puede apoyarse explícitamente en esa decisión sin asumir un antecedente implícito?
4. ¿Ha desaparecido toda documentación que describa una "jerarquía estricta" incompatible con el
   comportamiento real?
5. ¿El código funcional permanece idéntico?

## Fase 4B — Implementación

**Estado: ✅ Implementada.**

- **`docs/03-architecture/adr_025_task_goal_commitment_boundary.md` (nueva, retrospectiva):** declara
  Planning & Execution (Goal/Commitment/Task/Habit) un bounded context / shared kernel; formaliza la
  exclusión mutua `Task.goalId`/`Task.commitmentId` ya implementada, con la cronología real preservada
  (commit `1ead830`, 2026-07-18, 2 días antes de la auditoría) — marcada explícitamente "ADR
  retrospectiva," sin fingir que la decisión nace hoy. Referencia explícita a ADR-022 (introdujo el
  código sin discutir el límite) y ADR-023 (depende de esta exclusión como precedente).
- **`packages/domain/src/goal/aggregate/Goal.ts` (comentario de cabecera corregido, cero cambio
  funcional):** de _"Hierarchy: Goal -> Commitment -> Task/Habit"_ (lenguaje de jerarquía estricta que
  la auditoría pidió retirar) a una descripción que refleja el shared kernel real, citando ADR-025 y
  mencionando explícitamente que `Task` también enlaza directamente a `Goal`, exclusivo con cualquier
  enlace a `Commitment`.
- **`docs/03-architecture/adr_023_habit_commitment_relationship.md` (nota añadida, sin cambio de
  contenido técnico):** referencia explícita a ADR-025 en el punto donde ya citaba la exclusión de
  `Task` como precedente — la cita queda ahora fundamentada, el razonamiento de ADR-023 no cambia.
- **Verificado: `packages/domain` — 279/279 tests, cero regresión** (el único cambio de código real
  fue un comentario; ningún comportamiento de `Task`/`Goal`/`Habit` se tocó).

## Fase 5 — Validación

**Estado: ✅ Validada.**

Las 5 preguntas fijadas en Fase 4A, respondidas contra el resultado real:

1. **¿La decisión implementada tiene ahora una ADR que la formaliza explícitamente?** Sí — ADR-025.
2. **¿La ADR preserva la cronología real en lugar de reescribirla?** Sí — cita el commit `1ead830`
   (2026-07-18) como origen real, y se marca explícitamente "retrospectiva," con fecha de decisión
   separada de la fecha de formalización.
3. **¿ADR-023 puede apoyarse explícitamente en esa decisión sin asumir un antecedente implícito?** Sí
   — nota añadida con referencia cruzada a ADR-025, sin alterar el contenido técnico de ADR-023.
4. **¿Ha desaparecido toda documentación que describa una "jerarquía estricta" incompatible con el
   comportamiento real?** Sí — el comentario de `Goal.ts` ya no la describe; confirmado por grep que
   no queda ninguna otra ocurrencia de esa jerarquía en `packages/domain`.
5. **¿El código funcional permanece idéntico?** Sí — verificado por la suite completa de
   `packages/domain` (279/279 tests, cero regresión); el único cambio fue un comentario.

**Criterio de cierre, respondido:** AR-024 cierra sin alterar el dominio, y elimina una decisión crítica
que existía en la práctica pero no en la arquitectura explícita. D-024.1 queda materializada.

---

## Estado

**AR-024 CERRADA (2026-07-23).** El hallazgo original describía una decisión de límite de contexto sin
tomar. La evidencia mostró que la decisión ya estaba tomada e implementada en código desde antes de la
propia auditoría (exclusión mutua `Task.goalId`/`commitmentId`, commit `1ead830`, 2026-07-18).
Reencuadrado por la evidencia: no diseñar un límite, cerrar la brecha entre una decisión operativa y su
trazabilidad arquitectónica. D-024.1 aprobada e implementada mediante una ADR retrospectiva
(**ADR-025**) que preserva la cronología real, corrección del comentario de `Goal.ts`, y una nota de
trazabilidad en ADR-023 — sin ningún cambio de comportamiento del dominio (279/279 tests, cero
regresión). Las 5 preguntas de validación respondidas afirmativamente. Estado: 🟦 → ✅ Cerrada.
Decisión: ✅ Decisión aprobada → ✔️ Validada.
