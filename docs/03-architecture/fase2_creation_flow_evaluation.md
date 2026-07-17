# Fase 2 — Creation Flow Evaluation

Documento de evaluación, no una ADR. Responde las cuatro preguntas planteadas antes de conectar
`commitments/create.tsx` (TECH_DEBT Item 32), como preparación para ADR-019 Fase 2. Cada respuesta
está respaldada por lectura directa de código, no por suposición. No se tocó ningún archivo de
código al producir este documento.

---

## Entry points

**Candidato principal, confirmado por evidencia:** un botón "+" en la sección "Commitments" de
`GoalWorkspaceScreen.tsx` (`goals.workspace.commitments`, línea ~169), que hoy es la única sección
de esa pantalla sin acción de agregar — sus hermanas Hábitos (línea ~191) y Tareas/"Upcoming"
(línea ~217) ya tienen la suya. Añadir el botón ahí sigue exactamente el mismo patrón ya usado dos
veces en la misma pantalla — no introduce un patrón nuevo.

Para la mecánica de navegación, el repositorio ya tiene **dos** patrones de creación-con-contexto
distintos, ambos vigentes hoy:

1. **Ruta dedicada + query param** — Hábitos: `router.push('/habits/create?goalId=${goal.id}')`
   (`GoalWorkspaceScreen.tsx:198`). `commitments/create.tsx` ya es una ruta dedicada (modal), así
   que este es el patrón que más naturalmente encaja — extenderla a aceptar `?goalId=` es
   consistente, no una decisión nueva.
2. **Pantalla destino + prefill + diálogo inline** — Tareas: `router.push('/(tabs)/tasks?
prefillGoalId=${goal.id}')`, consumido por `TasksScreen.tsx:37,75-79` para abrir su propio
   diálogo de creación con el Goal precargado.

**Recomendación:** seguir el patrón 1 (igual que Hábitos), no inventar uno nuevo.

**Candidato secundario, opcional:** un botón "+" en la pestaña "Compromisos" de Goals
(`GoalTasksTab.tsx`, la lista plana de todos los Compromisos sin importar el Goal) para crear un
Compromiso sin Goal asociado. No es necesario para la primera versión de Fase 2 — puede diferirse.

---

## ¿Puede existir un Compromiso sin Goal?

**Sí, y el dominio ya lo confirma de la forma más fuerte posible: no modela la relación en absoluto
desde el lado de `Commitment`.**

Leído directamente en `packages/domain/src/commitment/aggregate/commitment.ts`:

- La clase `Commitment` no tiene ningún campo `goalId`.
- `Commitment.register(id, identityId, title, description, recurrencePattern?, targetDate?,
seriesId?, priority?)` — el único campo obligatorio es `title` (vía `identityId`, que siempre
  existe). Todo lo demás tiene default: `recurrencePattern → None`, `targetDate → null`,
  `priority → Medium`.
- La relación es exclusivamente propiedad de `Goal` (`Goal._commitmentIds`, `Goal.linkCommitment()`)
  — un Compromiso no "pertenece" a un Goal en su propio agregado, un Goal simplemente lo referencia
  si quiere.

Esto ya tiene un precedente idéntico resuelto en este mismo proyecto: **Item 18** (`TECH_DEBT.md`
v1.22.0) hizo exactamente este trabajo para `Habit` — "Goal is opt-in for Habits, not assumed" —
con `payload.goalId` opcional en creación, `relinkGoal()` para cambiarlo después, y un Hábito
deliberadamente sin Goal en el dataset de demo (`h-10`) para probar que el camino funciona.
**Recomendación: replicar el mismo patrón para Commitment**, no inventar uno nuevo.

**Gap real que hay que cerrar, independientemente de dónde se dispare la creación:**
`CommitmentModel.goalId` es hoy solo de demo (comentario propio: "Real backend doesn't have this
relationship yet"), y `demo-commitments.repository.ts`'s `create()` fija `goalId: undefined` sin
importar qué se le pase. Si no se corrige, un Compromiso creado desde Goal Workspace terminaría sin
enlazar al Goal — la UI parecería funcionar pero el dato quedaría mal. Este era ya el "segundo item
relacionado" de `TECH_DEBT.md` Item 31 (el gap de backend), no una sorpresa nueva.

---

## ¿Cuál es el flujo principal?

El flujo ideal que planteaste (`Goal → Crear Compromiso → Crear Tareas`) **no existe hoy ni
parcialmente en el último paso**, pero las piezas para construirlo ya están, dispersas y sin
conectar — no hay que diseñarlas desde cero.

- `CommitmentWorkspaceScreen.tsx` (la pantalla de detalle de un Compromiso, a la que ya se navega
  desde `GoalWorkspaceScreen.tsx` vía `router.push('/commitments/${c.id}')`) muestra título, badge
  de estado, metadata, barra de acciones (activar/pausar/reanudar/completar/cancelar) e historial —
  **pero no lista Tareas de ese Compromiso ni tiene botón de agregar una**. Confirmado leyendo el
  archivo completo.
- Sin embargo, `TaskForm.tsx` **ya tiene** un selector genérico de relación (`relationKind: 'goal'
| 'commitment'`) con soporte completo para `commitmentId` — no es un campo nuevo por diseñar, ya
  existe y se usa hoy para editar la relación de una Tarea existente.
- `tasksApi.relinkCommitment()` y el invariante de dominio `Task.relinkCommitment()`
  (mutuamente excluyente con `goalId`) también existen, probados, end-to-end.
- El patrón de navegación para "agregar Tarea con contexto" ya existe (`prefillGoalId` en
  `TasksScreen.tsx`) — extenderlo a `prefillCommitmentId` es el mismo patrón, un parámetro más.

**Conclusión:** el flujo principal completo (`Goal → Compromiso → Tarea`) es alcanzable conectando
piezas ya construidas, no diseñando piezas nuevas. Esto confirma tu propia expectativa de que, una
vez aprobada la evaluación, "la implementación debería ser bastante mecánica."

---

## ¿Quick Capture captura trabajo inmediato o también estructura?

Aquí la evidencia complica un poco la posición inicial ("no por ahora" para Commitment en Quick
Capture) — vale la pena verla completa antes de decidir.

Leyendo `QuickCaptureDialog.tsx` completo: **todos** los tipos hoy soportados reciben el trato más
mínimo posible, un solo campo de texto:

```ts
type === 'goal'  → goalsApi.create({ title: trimmed })                    // nada más
type === 'habit' → habitsApi.create({ title: trimmed, recurrenceType: 'Daily', reminderHour: 9, reminderMinute: 0 })  // defaults fijos, "fully editable afterward"
type === 'task'  → tasksApi.create({ title: trimmed })                    // nada más
type === 'note'  → notesApi.create({ text: trimmed })
```

`Goal` — probablemente la entidad más "estructural" de toda la jerarquía — ya recibe el mismo trato
de un solo campo que `Task`. Y el propio `Commitment.register()` del dominio **ya tiene defaults
para todo excepto el título** (`recurrencePattern → None`, `priority → Medium`, `targetDate →
null`) — exactamente el mismo nivel de "sensato por defecto, editable después" que ya usa Habit.
Así que el argumento de "Commitment necesita más estructura de la que Quick Capture permite" es más
débil de lo que parece a primera vista: el dominio ya resuelve esa estructura con defaults, igual
que lo hace para Habit.

Lo único que Quick Capture genuinamente no ofrece **para ningún tipo** es una asociación de Goal en
el momento de la captura — ni Goal (no aplica, es la raíz), ni Habit, ni Task la piden ahí. Todos
esos elementos nacen sin Goal y se enlazan después desde su propio flujo de edición. Si Commitment
siguiera el mismo patrón, no sería una excepción — sería consistente.

**Dónde sí hay un argumento real, no técnico sino de intención de producto:** ¿Quick Capture debe
seguir siendo un espacio de "agregar cosas sin comprometerme a nada todavía", y `Commitment` —dado
que la palabra misma implica compromiso— rompe esa promesa aunque técnicamente sea tan barato de
crear como un Task? Esa es una pregunta de filosofía de producto, no de arquitectura, y el código no
la responde por ti.

**No se resuelve en este documento**, tal como pediste. Se deja registrada con evidencia de ambos
lados para cuando decidas evaluarla por separado.

---

## Navigation changes (si se aprueba el flujo principal)

1. `apps/mobile/src/app/commitments/create.tsx` acepta `?goalId=` opcional (mismo patrón que
   `habits/create.tsx`).
2. `CreateCommitmentScreen.tsx` / `useCreateCommitment.ts` / `commitmentsApi.create()` pasan
   `goalId` de punta a punta hasta `demo-commitments.repository.ts`, que deja de hardcodear
   `goalId: undefined` y respeta el valor recibido (igual que ya hace `demo-habits.repository.ts`
   con `payload.goalId`).
3. Botón "+" nuevo en la sección Commitments de `GoalWorkspaceScreen.tsx`, idéntico en patrón a los
   de Habits/Upcoming ya existentes.
4. `CreateCommitmentScreen.tsx` hoy navega con `router.replace('/(tabs)')` (Today) al terminar —
   cuando viene con `goalId`, debería volver al Goal Workspace de origen en su lugar.
5. Fuera de alcance para esta fase: conectar Tarea↔Compromiso desde `CommitmentWorkspaceScreen.tsx`
   (agregar sección de Tareas + botón "+" con `prefillCommitmentId`) — es el resto del flujo ideal,
   técnicamente listo per el hallazgo de arriba, pero es un cambio adicional, no estrictamente
   parte de "conectar la pantalla huérfana." Se registra aquí para no perderlo, no se asume incluido.

---

## Acceptance criteria

- [ ] Un usuario puede tocar "+" en la sección Commitments de un Goal Workspace y llegar a
      `commitments/create.tsx` con ese Goal como contexto.
- [ ] Al guardar, el Compromiso creado queda enlazado a ese Goal (en modo demo; el backend real
      sigue sin esta relación — gap ya trackeado, no una sorpresa nueva de esta fase).
- [ ] Al guardar, la navegación regresa al Goal Workspace de origen, no a Today.
- [ ] La copy de `commitments/create.tsx` no cambia — ya dice "Compromiso", ya es correcta según
      ADR-019.
- [ ] Quick Capture **no se modifica** como parte de esta fase — la pregunta queda abierta,
      explícitamente no resuelta aquí.
- [ ] (Opcional, puede diferirse) botón "+" en la pestaña plana "Compromisos" de Goals para crear
      un Compromiso sin Goal.
- [ ] (Fuera de alcance, registrado para después) conectar la creación de Tareas desde el detalle
      de un Compromiso.

---

_No implementado. Esperando aprobación antes de tocar código._
