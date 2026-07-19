# 🏛️ ADR-023: Habit↔Commitment Relationship

**Estado:** ✅ **Decidida** (2026-07-19). Precedida por
`docs/03-architecture/habit_commitment_relationship_review.md` (domain review, mismo día) — esa
revisión encontró que la relación no existe en ninguna capa hoy, lo que reencuadró esta ADR de
"formalizar casos borde de una relación existente" (lo que fue ADR-022 para Task↔Commitment) a
"decidir si esa relación debe introducirse en absoluto." Implementación **no incluida** en esta ADR —
es una decisión de modelo, no una historia; la implementación (si aplica) se planifica por separado.

**Implementación deliberadamente no priorizada (2026-07-19).** Esta ADR deja el modelo listo, no
abre una historia. Se implementa cuando exista un caso de uso funcional concreto que la necesite —
ejemplos ya identificados, no exhaustivos: mostrar qué hábitos apoyan un Commitment en su propio
detalle, sugerir hábitos relevantes al crear un Commitment, o enriquecer Analytics relacionando
hábitos con compromisos. Hasta entonces, esta ADR ya cumple su propósito: el modelo queda definido
sin necesidad de reabrir el debate cuando llegue el momento.

---

## Contexto

ADR-022 §1 ya clasificó formalmente a `Habit` como **Execution Aggregate** (igual que `Task`) y
concluyó explícitamente que su ciclo de vida (`Active`/`Disabled`/`Archived`, sin `Draft`) **no
requiere modificación** — no hay ninguna base en esta ADR, ni en la anterior, para tratar "Habit
Lifecycle" como una expansión de estados al estilo Task. Esa pregunta quedó cerrada en ADR-022 y esta
ADR no la reabre.

Lo que ADR-022 sí dejó abierto, explícitamente (§3.1, §12, y el comentario en
`Commitment.activate()`): la precondición de activación de `Commitment` original decía "al menos una
Task **o Habit** vinculada" (un plan de ejecución), pero solo la mitad de `Task` se implementó —
`TaskBasedCommitmentActivationPreconditions.hasExecutionPlan()` consulta únicamente
`taskRepository.findByCommitmentId()`. La mitad de `Habit` se dejó pendiente porque, en ese momento,
**no existía ninguna relación `Habit↔Commitment` de la cual consultar** — ni siquiera un campo. El
comentario en el dominio lo dice tal cual: "the Habit half of that check isn't resolvable yet (no
Habit<->Commitment relationship exists)."

Esta ADR resuelve esa pregunta pendiente — pero, como confirma el domain review, resolverla no
significa automáticamente "implementar la mitad que faltaba." Primero hay que decidir si esa relación
debe existir, y de qué forma.

## La pregunta de producto que precede a cualquier decisión técnica

**¿Qué representa un `Commitment` dentro de Commitment?** Según la visión de producto ya establecida
(Commitment como sistema operativo de crecimiento personal, no gestor de tareas), un `Commitment`
representa un plan de ejecución acotado en el tiempo — algo con un propósito específico que
eventualmente se completa o se cancela. Un `Habit`, en cambio, representa una capacidad o identidad
sostenida — algo que típicamente **sobrevive** a cualquier plan concreto que lo haya motivado
originalmente.

Ejemplo del propio análisis que originó esta ADR: un hábito de "beber 2L de agua diario" puede haber
nacido dentro de un Commitment de "Nutrition", pero seguir siendo relevante mucho después de que ese
Commitment se complete o se abandone por un plan distinto. Forzar que ese hábito depende
estructuralmente de un Commitment específico — con cascadas, con ownership, con lifecycle
compartido — modelaría mal esa realidad.

## Opciones evaluadas

**Opción 1 — Sin relación.** Retirar el comentario/TODO en `Commitment.activate()`, dejar la
precondición como "≥1 Task" sin más, y no introducir ningún campo nuevo. Más simple, pero pierde la
posibilidad de que un Commitment muestre "qué hábitos apoyan este plan" en su propia pantalla — algo
que sí tiene valor de producto real (ver ejemplo en Contexto).

**Opción 2 — Asociación débil.** Un `Habit` puede declarar que apoya 0..n `Commitment`s, sin
ownership, sin cascadas, sin que esa asociación cuente para ninguna invariante de activación. Es
información de "apoyo", no de dependencia.

**Opción 3 — Relación fuerte (ownership), espejando Task↔Commitment.** `Habit.commitmentId: string |
null` exclusivo, cascada de archivado/cancelación, la asociación cuenta para la precondición de
activación — el mismo patrón que ADR-022 estableció para `Task`.

**Opción 3 se descarta.** No por analogía inversa, sino porque la premisa que la sostiene (que Habit
y Task tienen la misma naturaleza de "pertenecer a un plan") ya fue evaluada y rechazada en el
Contexto de esta misma ADR. Aplicar el patrón de Task a Habit únicamente porque ADR-022 ya lo definió
para Task sería exactamente el tipo de razonamiento por analogía que la disciplina de este ciclo
(Domain Exposure Verification) existe para prevenir — verificar el dominio real, no asumir que un
patrón exitoso en un lugar se traslada automáticamente a otro con una naturaleza distinta.

## Decisión

**Opción 2 — Asociación débil, sin ownership, sin cascadas.**

### Modelo de datos

Ya existe un precedente arquitectónico directo y ya en producción para exactamente esta forma de
relación: **`Goal.commitmentIds: string[]`** (ADR-021) — un array en el lado que "usa" la relación,
sin que el otro lado la posea, sin cascadas de lifecycle entre `Goal` y `Commitment` más allá de las
ya explícitamente definidas. `Goal` incluso ya tiene el mismo patrón para `Habit`
(`Goal.habitIds[]`/`Goal.linkHabit()`), aunque esa es una relación 1-Goal-por-Habit (vía
`Habit.goalId` exclusivo), distinta en cardinalidad a la que se decide aquí.

Siguiendo ese precedente:

```typescript
// Habit — nuevo campo, aditivo, NO excluyente con goalId
interface HabitProps {
  // ...todo lo existente sin cambios...
  goalId: string | null; // sin cambios — relación existente, exclusiva, 1 Goal
  commitmentIds: string[]; // NUEVO — 0..n, no excluyente con goalId
}
```

**Por qué no es excluyente con `goalId` (a diferencia de Task):** `Task.goalId`/`Task.commitmentId`
son mutuamente excluyentes porque una Task existe para un plan concreto — o bien es parte de un Goal
directamente, o bien es parte de la ejecución de un Commitment específico, nunca ambos. Un `Habit` no
tiene esa naturaleza de pertenencia única: mantiene su relación primaria con un `Goal` (sin cambios,
ya existente) **y**, adicionalmente, puede declarar que apoya varios Commitments a la vez sin que eso
compita con esa relación. Son dos facetas distintas del mismo agregado, no alternativas.

**Método:** `Habit.linkCommitment(commitmentId: string): void` / `Habit.unlinkCommitment(commitmentId:
string): void`, idempotentes, mismo estilo que `Goal.linkCommitment()`/`Goal.linkHabit()`. No
requiere que `Commitment` conozca nada de `Habit` — ninguna consulta cruzada de agregados, ningún
`forwardRef()`, ningún riesgo de dependencia circular (el mismo problema que ADR-022 §3.2 ya resolvió
para el caso de Task, aquí evitado por diseño en vez de resuelto con Command Preconditions, porque no
hay invariante que forzar).

### Consecuencias explícitas (todas confirmadas por el usuario, no inferidas)

- **No hay cascadas.** Archivar, pausar o cancelar un `Commitment` no afecta a ningún `Habit`
  vinculado — su estado (`Active`/`Disabled`/`Archived`) es completamente independiente.
- **No hay ownership.** Eliminar (o cancelar) un `Commitment` no elimina ni afecta ningún `Habit` que
  lo tuviera en su `commitmentIds`.
- **No hay lifecycle compartido.** Completar una ocurrencia de un `Habit` no completa, ni afecta de
  ninguna forma, a ningún `Commitment` vinculado.
- **La precondición de activación de `Commitment` queda resuelta como "≥1 Task", sin la mitad de
  Habit.** El comentario/TODO en `Commitment.activate()` (línea ~137, citado arriba) se retira —
  no porque la mitad de Habit "quedó pendiente de implementar," sino porque se decide formalmente que
  **nunca debió contar** para esa invariante. Los hábitos son "un mecanismo de ejecución transversal,"
  no un requisito de activación (razonamiento del usuario, adoptado tal cual). El mensaje de error ya
  dice "at least one linked Task" — el código de producción ya refleja esta decisión; solo el
  comentario queda desactualizado.

### Alcance explícito — qué NO decide ni implementa esta ADR

- **No implementa el campo `commitmentIds`/los métodos `linkCommitment()`/`unlinkCommitment()`** —
  esta ADR decide el modelo, no ejecuta la historia. Implementación (dominio, comando backend, UI) es
  trabajo futuro a planificar por separado si se prioriza.
- **No decide la UI** — si esta asociación se expone como parte de `HabitForm`'s "Relacionado con"
  (mirroring cómo `TaskForm` ya tiene Ninguno/Objetivo/Compromiso), como una sección en el detalle del
  Commitment ("hábitos que apoyan este plan"), ambas, o ninguna todavía, es una decisión de UX
  separada.
- **No decide si el Reminder Engine, Calendar o Analytics deben leer esta asociación** — hoy ninguno
  de los tres tiene ninguna dependencia de Commitment para Habit (confirmado en el domain review) y
  esta ADR no cambia eso; si en el futuro se quiere, por ejemplo, mostrar en el detalle de un
  Commitment "estos hábitos lo apoyan, con este streak," es una historia de exposición futura sobre
  un modelo que esta ADR ya deja listo, no parte de esta decisión.
- **No reabre el ciclo de vida de Habit** (`Active`/`Disabled`/`Archived`) — confirmado sin cambios,
  consistente con ADR-022 §1's propia conclusión.

## Implicaciones futuras

Esta ADR define únicamente el **modelo de asociación** entre `Habit` y `Commitment`. Explícitamente,
**no implica** ninguna de las siguientes capacidades, y ninguna debe asumirse como consecuencia
natural de que `commitmentIds` exista:

- Sincronización de estados entre `Habit` y `Commitment`.
- Ownership de `Habit` por parte de `Commitment`.
- Cascadas de ningún tipo — archivar, pausar, cancelar o completar un `Commitment` no debe disparar
  ningún efecto sobre ningún `Habit` vinculado, ni ahora ni como extensión "natural" futura de este
  modelo.
- Cambios en el Reminder Engine — los recordatorios de `Habit` siguen sin depender de ningún
  `Commitment`.
- Cambios en Analytics — streaks y completion rate de `Habit` se siguen calculando sin referencia a
  `Commitment`.
- Cambios en Calendar — que una ocurrencia de `Habit` aparezca en la agenda diaria sigue sin depender
  del estado de ningún `Commitment` vinculado.

Cualquiera de estas capacidades, si en algún momento se considera necesaria, requiere su propia ADR o
historia — no se deriva automáticamente de la existencia de `Habit.commitmentIds[]`. Ejemplo concreto
del razonamiento que esta sección existe para prevenir: _"como ahora existe `commitmentIds`, los
hábitos deberían deshabilitarse automáticamente cuando su Commitment se pausa."_ La respuesta, ya
documentada desde esta ADR, es **no** — esa sería una cascada, y esta ADR decide explícitamente que
no las hay.

## Consecuencias

- `packages/domain/src/commitment/aggregate/commitment.ts`'s comentario sobre "the Habit half... see
  ADR-022 §3.1 and §12 (deferred to a future 'ADR-023')" queda obsoleto y debe corregirse para
  reflejar esta decisión — actualización de comentario únicamente, no un cambio de comportamiento
  (`hasExecutionPlan` ya solo evalúa Task).
- `TECH_DEBT.md`/`ENGINEERING_BOARD.md` deben reflejar esta ADR como cerrando el ítem "candidate
  ADR-023," sin dejarlo abierto indefinidamente como estaba.
- Si en el futuro se prioriza implementar `Habit.commitmentIds[]`, esta ADR es la referencia de
  modelo — no requiere una ADR nueva para la implementación en sí, solo para revisar esta decisión si
  la evidencia de dominio cambia.
