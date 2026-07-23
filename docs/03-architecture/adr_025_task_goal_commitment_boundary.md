# 🏛️ ADR-025: Límite Task ↔ Goal ↔ Commitment

**Estado:** ✅ Decidida (2026-07-18, formalizada 2026-07-23). **ADR retrospectiva** — formaliza una
decisión que ya estaba implementada y operativa en el dominio antes de esta ADR, sin haber sido
documentada formalmente hasta ahora. Producto de **AR-024**
(`docs/ARCHITECTURE_REMEDIATION/AR-024/ANALISIS.md`), del programa Architecture Remediation v1.0. No
introduce ningún cambio de comportamiento — el código ya se comportaba exactamente como aquí se
formaliza desde el commit `1ead830` (2026-07-18, _"feat(task): implement ADR-022 Task Lifecycle &
Execution Model"_), 2 días antes de que la Architecture Review (2026-07-20) describiera esta relación
como una decisión sin tomar.

---

## Contexto

La Architecture Review v1.0 (Iteración 3, `docs/ARCHITECTURE_REVIEW/fase-1-nucleo/03-bounded-contexts.md`)
encontró que `Task` tiene tanto `commitmentId: CommitmentId | null` como `goalId: string | null` —
puede vincularse a un `Goal` directamente, sin `Commitment` intermedio — mientras que el comentario de
cabecera de `Goal.ts` afirma una _"Hierarchy: Goal -> Commitment -> Task/Habit"_ como si fuera una
jerarquía estricta y asentada. La auditoría concluyó que ambas lecturas eran defendibles desde el
código y que **ninguna había sido decidida**.

AR-024 (`docs/ARCHITECTURE_REMEDIATION/AR-024/ANALISIS.md`) reexaminó este hallazgo y encontró que la
premisa de la auditoría — que la decisión seguía pendiente — era incorrecta. El código ya impone
exclusión mutua entre `goalId` y `commitmentId` (`Task.relinkGoal()`/`Task.relinkCommitment()`, cada
uno limpia el otro campo al establecerse), introducida en el mismo commit que implementó ADR-022, dos
días antes de que la auditoría describiera el campo doble como ambiguo. La auditoría verificó que ambos
campos coexistían, pero no verificó si el código los trataba como excluyentes.

Adicionalmente, **ADR-023** (Habit↔Commitment, decidida 2026-07-19 — un día antes de la propia
auditoría) ya cita esta exclusión de `Task` como precedente para justificar su propia decisión sobre
`Habit`, sin que ninguna ADR la hubiera formalizado todavía: _"Task.goalId/Task.commitmentId son
mutuamente excluyentes porque una Task existe para un plan concreto... Un Habit no tiene esa naturaleza
de pertenencia única."_

Esta ADR no decide nada nuevo — documenta, con la cronología real preservada, una decisión que el
dominio ya implementaba.

## Decisión

**Planning & Execution (`Goal`, `Commitment`, `Task`, `Habit`) es un único bounded context / shared
kernel**, no una jerarquía estricta de capas obligatorias. Dentro de ese contexto:

- Una `Task` pertenece exactamente a un plan de ejecución: **o bien** un `Goal` directamente (sin
  `Commitment` intermedio), **o bien** la ejecución de un `Commitment` específico — nunca ambos a la
  vez. `Task.goalId` y `Task.commitmentId` son mutuamente excluyentes, impuesto por el propio agregado
  (`relinkGoal()`/`relinkCommitment()`, cada método limpia el campo contrario).
- El enlace directo `Task → Goal` **es intencional y permanente**, no una desviación de una jerarquía
  que debía atravesar `Commitment` obligatoriamente. No es una violación de límite — es la forma en que
  este shared kernel modela que no todo plan de ejecución concreto requiere un `Commitment` explícito.
- `Habit` sigue el mismo principio de pertenencia única respecto a `Goal` (`goalId`, exclusivo), pero
  con una faceta adicional resuelta por separado en **ADR-023**: puede además declarar una asociación
  débil, no excluyente, con 0..n `Commitment`s (`commitmentIds[]`, sin ownership ni cascadas) — una
  relación de naturaleza distinta a la de `Task`, ya justificada en esa ADR.

## Justificación

- **El código ya se comporta así, de forma estable, desde antes de esta ADR.** Formalizar lo contrario
  requeriría revertir un comportamiento en producción sin ningún hallazgo que lo motive — ninguna de
  las 13 remediaciones cerradas hasta ahora, ni la propia Fase 1 de AR-024, encontró un defecto
  funcional en esta exclusión mutua.
- **ADR-023 ya depende de esta decisión.** Formalizarla retrospectivamente no le añade autoridad post
  hoc a ADR-023 (que no la necesita — cita el comportamiento como contexto, no como su propia
  decisión); simplemente le da a esa cita un fundamento explícito que hasta ahora no existía.
- **Es la Alternativa (a) que la propia auditoría original ya recomendaba** ("declarar Planning &
  Execution un bounded context / shared kernel, documentar que el enlace directo Task→Goal es
  intencional, y retirar el lenguaje de 'jerarquía estricta' de `Goal.ts`'s comentario por engañoso") —
  esta ADR ejecuta exactamente esa recomendación, con la evidencia adicional (cronología vía `git log`)
  de que el propio dominio ya la había adoptado antes de que la auditoría terminara de escribirse.

## Alternativas Rechazadas

- **Tratar `Commitment` como intermediario obligatorio entre `Goal` y `Task`** (la otra lectura que la
  auditoría dejó abierta). Rechazada: exigiría eliminar `Task.goalId` y migrar todo enlace directo
  existente a través de un `Commitment` sintético — un cambio de comportamiento real, no una
  formalización, sin ningún hallazgo de Fase 1 que lo justifique.
- **Modificar ADR-023 para que absorba esta decisión.** Rechazada: ADR-023 depende de esta exclusión,
  no debe convertirse retrospectivamente en su origen — eso rompería la trazabilidad causal real
  (ADR-023 es posterior en dependencia lógica, no en fecha de formalización).
- **Corregir únicamente el comentario de `Goal.ts` sin una ADR dedicada.** Rechazada: resolvería el
  síntoma documental pero dejaría la decisión sin una ADR que otras decisiones (como ADR-023) puedan
  referenciar explícitamente — exactamente el problema que motivó esta AR.

## Relación con otras ADR

- **ADR-022** (Task Lifecycle & Execution Model) introdujo, en el mismo commit, el código que impone
  esta exclusión mutua — sin discutirla explícitamente como una decisión de límite de contexto. Esta
  ADR no reemplaza ni modifica ADR-022; documenta una consecuencia de su implementación que quedó sin
  formalizar.
- **ADR-023** (Habit↔Commitment) cita esta exclusión de `Task` como precedente. Esta ADR le da a esa
  cita un fundamento explícito — el contenido técnico de ADR-023 no cambia.
- **No reemplaza ni contradice ninguna ADR existente** — es puramente aditiva.

## Impacto sobre el programa de remediación

Cierra AR-024. Desbloquea AR-025 y AR-027 (Roadmap), que dependían de que este límite quedara resuelto.

---

🔒 **DOCUMENTO CONGELADO — ARCHITECTURE DECISION RECORDS**
