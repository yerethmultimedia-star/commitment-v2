# Draft Lifecycle UX Assessment

**Estado:** Evaluación de producto (no una ADR, no un plan de implementación). Abierta tras el
Golden Path de Goal (`docs/07-quality/golden_path_goal_creation.md`), que encontró que un Goal
recién creado queda invisible en toda la pantalla de Objetivos — el mismo patrón que
`golden_path_commitment_creation.md` ya había encontrado y dejado deliberadamente sin resolver para
Commitment. La pregunta original era única:

> ¿Qué significa realmente el estado `Draft` para el usuario?

**Reencuadre (2026-07-18, misma investigación):** la evidencia reunida en las secciones 2-3 no
apunta a una sola pregunta transversal — apunta a **dos preguntas distintas, de naturaleza
diferente, que hoy comparten el mismo nombre de estado**:

1. **Para Commitment, es una pregunta de UX.** El dominio ya soporta ambas respuestas
   (`activate()`, el comando, el botón "Activar" existen y funcionan) — falta decidir si se usa esa
   capacidad o no.
2. **Para Goal, es una pregunta de dominio, no de UX.** La sección 6 (añadida en esta revisión)
   confirma con evidencia adicional que `GoalState.Active` no tiene ningún rastro de haber sido una
   decisión de diseño consciente — es plausible que sea un estado muerto, nunca necesario, en vez de
   una transición pendiente de construir.

Este documento sigue sin elegir una respuesta para ninguna de las dos preguntas — reúne evidencia y
dejan las alternativas con sus consecuencias.

---

## 1. Alcance real — no todos los agregados tienen este problema

Revisando los cuatro agregados directamente en el dominio:

| Agregado     | ¿Tiene `Draft`? | Estado inicial real          |
| ------------ | --------------- | ---------------------------- |
| `Commitment` | ✅ Sí           | `Draft`                      |
| `Goal`       | ✅ Sí           | `Draft`                      |
| `Task`       | ❌ No           | `Pending` (sin etapa previa) |
| `Habit`      | ❌ No           | `Active` directamente        |

Solo Commitment y Goal tienen esta pregunta. No es necesario diseñar una respuesta que cubra Task o
Habit — no la necesitan hoy. Esto acota el alcance de la decisión a los dos agregados donde el
problema realmente existe, y probablemente a cualquier futuro agregado que adopte el mismo patrón
de dos etapas (borrador → confirmación).

---

## 2. Lo que ya existe para cada uno — una asimetría real

### Commitment — el camino de salida de `Draft` ya está construido, solo nunca se probó

- El dominio tiene una transición explícita: `Commitment.activate()` (Draft → Active), con su
  propio comando de backend (`ActivateCommitmentCommand`, `POST /commitments/:id/activate`, ya
  implementado y funcionando).
- La UI también la tiene: `commitmentActions.ts` mapea `draft: ['activate', 'cancel']`, y
  `CommitmentActionBar.tsx` (renderizado en `CommitmentWorkspaceScreen.tsx`, la pantalla de detalle)
  muestra un botón "Activar" cuando el Commitment está en `Draft`.
- La lista donde se llega a esa pantalla (`GoalTasksTab.tsx`, la pestaña "Compromisos") **no filtra
  por estado** — muestra todos los Commitments, `Draft` incluido. Un Commitment recién creado en
  modo real sí sería visible ahí y sí se podría abrir y activar.
- **Por qué nunca se notó:** `demoGoalsRepository`'s hermano, `demoCommitmentsRepository.create()`,
  fuerza `state: 'Active'` directamente — el mismo atajo que Goal. En modo demo, el camino
  Draft→Activar nunca se ejerce, así que nadie lo vio nunca en acción, aunque el código para
  hacerlo ya existe y compila.

### Goal — no solo falta la UI, falta la transición misma

- `GoalWorkspaceScreen.tsx`'s Objetivos list SÍ filtra por estado (los tres chips
  Activos/En progreso/Completados), y no hay ninguna vista "todos" ni "borradores". Un Goal en
  `Draft` no es alcanzable desde ningún punto de la UI — a diferencia de Commitment, donde al menos
  técnicamente se podría llegar.
- Más importante: **el agregado `Goal` no tiene ningún método que haga la transición Draft→Active.**
  `GoalState.Active` está definido en el enum pero es estructuralmente inalcanzable — ningún método
  del agregado (`register`/`rename`/`linkCommitment`/`linkHabit`/`complete`/`archive`) lo asigna.
  `complete()` sí permite completar directamente desde `Draft` o `Active` indistintamente. Esto
  sugiere que, tal como está diseñado hoy, Goal nunca tuvo la intención de necesitar una activación
  explícita — puede ir de `Draft` a `Completed` o a `Archived` sin pasar por `Active`.

**Consecuencia de esta asimetría:** no es seguro asumir que Commitment y Goal deban resolver esta
pregunta de la misma forma solo porque comparten el nombre del estado. Commitment ya tiene una
intención de diseño visible (activación explícita); Goal, tal como está construido, no la tiene.
La decisión debe ser transversal en el sentido de "una sola vez, con criterio compartido" — no
necesariamente en el sentido de "idéntica implementación para ambos."

---

## 3. Las tres opciones, con evidencia aplicada

### Opción A — Activar automáticamente al crear

`Draft` deja de ser el estado inicial habitual y pasa a ser un caso excepcional (o desaparece del
flujo normal por completo).

- **A favor:** es lo que Demo Mode ya hace hoy, para ambos agregados, sin que nadie lo haya
  cuestionado como mala experiencia — sugiere que puede ser genuinamente lo que el producto quiere.
- **En contra:** para Commitment, esto dejaría sin uso el comando `activate()`/botón "Activar" ya
  construido — no roto, simplemente nunca alcanzado. Para Goal, no hay nada que dejar sin uso (la
  transición no existe), así que aplicar A a Goal es más barato que aplicar A a Commitment.
- **Costo de implementación:** bajo para ambos — es básicamente codificar en el backend lo que el
  demo ya hace en el cliente.

### Opción B — Mostrar `Draft` en la UI

`Draft` se convierte en un estado visible y gestionable por el usuario (una pestaña/chip "Borrador"
o una vista "todos" sin filtrar).

- **A favor:** aprovecha el trabajo ya hecho para Commitment (`activate()`, el botón, el comando de
  backend) — sería el único de los tres casos que no descarta código ya construido.
- **En contra:** para Goal, requiere decidir qué significa un Goal en Draft en la UI (¿aparece en
  Insights? ¿cuenta en las métricas del Dashboard? ¿puede tener Commitments/Habits enlazados antes
  de activarse?) — preguntas de producto nuevas, no solo una etiqueta de UI.
- **Costo de implementación:** medio — nueva UI para ambos, más una decisión adicional sobre cómo
  se comporta un Goal en Draft en el resto de la app (Dashboard, Insights).

### Opción C — Mantener `Draft` oculto hasta una acción explícita

Debe existir una acción clara para pasar de `Draft` a `Active`, y un usuario no puede "perder" un
objeto recién creado.

- **A favor:** es, en la práctica, el diseño que Commitment ya tiene a medias — solo falta hacerlo
  alcanzable (la lista de Compromisos ya no filtra, así que "alcanzable" ya está resuelto para
  Commitment; falta solo que el usuario entienda que debe activar).
- **En contra:** para Goal, esto requeriría **construir la transición desde cero** — un nuevo
  comando de dominio (`ActivateGoal`), su handler, su endpoint, su UI — no existe ningún punto de
  partida, a diferencia de Commitment. Es la opción más cara de las tres para Goal específicamente.
- **Riesgo mencionado por el usuario:** si se elige esta opción, un objeto recién creado no puede
  quedar efectivamente perdido — la UI debe garantizar que el camino Draft→Active sea obvio e
  inmediato, no un botón escondido tres pantallas después.

---

## 4. Goal — ¿`Active` es una transición pendiente o un estado muerto?

Comprobación adicional (2026-07-18), dirigida explícitamente a distinguir entre "falta construir la
transición" y "el estado nunca debió existir":

- **Una única referencia a `GoalState.Active` en todo el código** (`grep` exhaustivo sobre
  `apps/`+`packages/`) — dentro de `Goal.complete()`, y esa rama es alcanzable solo cuando el
  estado es `Archived` (los otros tres casos ya están cubiertos por chequeos anteriores en el mismo
  método), por lo que la comparación con `Active` específicamente nunca resulta determinante en la
  práctica.
- **`packages/domain/src/goal/aggregate/goal.ts` tiene un único commit en toda su historia**
  (`git log --all`) — nunca fue modificado desde que se creó. No hay evidencia de que `Active` haya
  sido alcanzable en algún momento anterior y se haya quitado después.
- **Cero menciones de `GoalState`/el ciclo de vida de Goal en ADR-019, ADR-021, o cualquiera de los
  documentos de investigación de Goal Backend** (`goal_backend_current_assessment.md`,
  `goal_backend_alternatives_evaluation.md`).

No hay ningún rastro de una decisión de diseño consciente detrás de `Active`, ni una regla que
dependa de él, ni un caso de uso documentado. Es consistente con la hipótesis de que llegó al enum
por similitud con el estado de `Commitment` (donde sí es real y necesario) en el momento en que se
escribió el agregado de `Goal`, no por una necesidad propia de `Goal`. Esto no confirma
definitivamente que deba eliminarse — sigue siendo una decisión de producto/dominio, no algo que
este documento resuelva — pero sí cambia el marco: la pregunta para Goal no es necesariamente "¿qué
UI construimos para la activación?" sino, primero, "¿existe una razón real para que `Active` exista
como estado de `Goal`?"

---

## 5. Lo que este documento no resuelve

- Cuál de las tres opciones (sección 3) se adopta para Commitment — es una decisión de producto, no
  de arquitectura.
- Si `GoalState.Active` debe eliminarse del agregado — la sección 4 reúne evidencia a favor de esa
  hipótesis, pero la decisión final (mantenerlo como transición pendiente vs. retirarlo como estado
  muerto) sigue sin tomarse aquí.
- Si Commitment y Goal deben terminar con el mismo comportamiento exacto — dado que hoy ya parten de
  puntos de diseño distintos, es cada vez menos probable que deban converger en una respuesta única.
- Qué debería pasar con Task/Habit si en el futuro adoptan un estado `Draft` — fuera de alcance,
  ninguno lo tiene hoy.

## 6. Qué desbloquea, una vez decidido

`docs/07-quality/golden_path_goal_creation.md` puede retomarse exactamente desde el paso 5, sin
volver a ejecutar los pasos 1-4 (ya verificados: sesión real, navegación, Quick Capture, creación
contra el backend real todo funcionan). El mismo criterio aplicado a Commitment debería, en algún
momento, generar un Golden Path #1 v2 que verifique el camino Draft→Active recién descubierto como
código-existente-pero-nunca-ejercido.
