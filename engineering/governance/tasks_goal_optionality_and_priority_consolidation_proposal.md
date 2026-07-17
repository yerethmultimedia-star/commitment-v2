# Propuesta: Task↔Goal opcional + consolidación de "Priority Task" (VS-032, Fase 2)

Version: 2.1.0 — implementado
Status: **Implementado y verificado (2026-07-15)** — ver `TECH_DEBT.md` Item 22 para el detalle de
resolución y verificación completos
Owner: Architecture Review Board
Date: 2026-07-15

Changelog v2.0.0: incorpora las 7 correcciones del usuario sobre v1.0.0 (relación única
Goal/Commitment no competidora, scoring en vez de orden fijo, estructura de Hero consistente,
selector unificado en TaskForm, ampliación del dataset, checkpoint obligatorio). Añade hallazgos de
una segunda pasada de verificación de código.

---

## Resumen ejecutivo

v1.0.0 corrigió la premisa: "Priority Task" ya es una proyección sobre una Task real y ya
reutiliza `TasksScreen`/`TaskForm` — no hay pantallas paralelas que eliminar ni unificar. Esa
conclusión se mantiene. Esta versión revisa el **cómo** de los gaps reales según el feedback:
relación única (no dos selectores compitiendo), selección por score (no por jerarquía de origen
fija), estructura de Hero Card consistente, y una segunda pasada de código encontró un gap
adicional no visto en v1.0.0: **`TaskForm` hoy solo permite fijar el Commitment al crear — no se
puede cambiar en edición**, y **no existe ningún método de relink de Commitment en el agregado
Task** (paralelo exacto a lo que Habit tenía antes de hoy).

## Hallazgos de código (verificados, segunda pasada)

- `Goal.commitmentIds`/`habitIds` (agregado) **no son la fuente de verdad para "qué está vinculado
  a este Goal"** en la UI — `GoalWorkspaceScreen.tsx` deriva `linkedHabits` en vivo filtrando
  `habits.filter(h => h.goalId === goalId)` (línea 51-53), no leyendo `goal.habitIds`. Mismo patrón
  se aplicará a Tasks vinculadas por Goal directo.
- `GoalWorkspaceScreen.tsx:55-58` — `linkedTasks` hoy **solo** considera
  `tk.commitmentId && goal.commitmentIds.includes(tk.commitmentId)`. No hay ninguna vía para tareas
  vinculadas directo a un Goal. Este es el punto exacto a corregir.
- `TaskForm.tsx:145` — el selector de Commitment está envuelto en `{!task && (...)}`: **solo existe
  al crear**. Editar una tarea no permite cambiar (ni quitar) su Commitment hoy. Gap no detectado en
  v1.0.0.
- `Task` (agregado) no tiene ningún método `relink*` — `commitmentId`/`goalId` solo se fijan en
  `register()`. Confirma que hace falta el mismo patrón de método dedicado que construimos hoy para
  Habit, mínimo dos veces (Goal y Commitment).
- `Goal` no tiene backend (`goalsApi` enruta 100% a `demoGoalsRepository`, ya documentado y
  aceptado como TD-10/A1) — la resolución "Commitment pertenece a un Goal" para mostrar contexto en
  el Hero solo puede hacerse contra el dataset demo, igual que ya ocurre en `GoalWorkspaceScreen`.
  No es una limitación nueva de esta propuesta.
- El `RecommendationEngine` de clase existente (`dashboard/engine/recommendation/`) es un sistema
  distinto: agrega `Recommendation[]` (tips de Coach, promote/demote de widgets) desde providers
  configurables. **No se toca ni se fusiona** — `computePriorityTask()` vive aparte
  (`useDashboardContext.ts`) y es el que se reescribe a scoring. Aclaro esto para no crear la
  impresión de que unifico dos sistemas que tienen responsabilidades distintas.

## 1. Relación única Goal/Commitment (no competidora)

`Task.goalId` se usa **solo** cuando la tarea está vinculada directo a un Goal, sin Commitment de
por medio. Si la tarea tiene `commitmentId`, `goalId` permanece `null` — el Goal (si existe) se
resuelve en lectura (`goal.commitmentIds.includes(task.commitmentId)`), nunca se duplica en el
registro. Regla de invariante en el agregado: `relinkGoal(goalId)` con `goalId != null` exige
`commitmentId === null` (y viceversa) — fijar uno limpia el otro.

## 2. Selección de Priority Task por score, no por orden fijo

`computePriorityTask()` se reescribe: candidatos = todas las tareas `pending` de hoy (vencidas o
con vencimiento hoy), sin importar origen. Cada una recibe un score:

```
score = priorityWeight[task.priority]        // high=30, medium=15, low=0
      + (overdue ? 25 : dueToday ? 15 : 0)
      + (commitment activo vinculado ? 10 : 0)
      + (goal de alta prioridad vinculado (directo o vía commitment) ? 5 : 0)
```

Gana el score más alto; empates conservan orden de array (igual que hoy). Pesos viven en una
constante exportada (`PRIORITY_TASK_SCORE_WEIGHTS`) para ser auditables/ajustables sin tocar la
lógica. Esto reemplaza el árbol `(a→b→c)` de v1.0.0 por completo.

## 3. `DashboardPriorityTask` — estructura Hero consistente

```ts
interface DashboardPriorityTask {
  taskId: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  contextLabel: string; // SIEMPRE presente: Goal > Commitment > i18n "Personal"
  commitmentId?: string;
  commitmentTitle?: string;
  commitmentProgressRatio?: number;
  goalId?: string;
  goalTitle?: string;
}
```

`DashboardHeroCard` renderiza siempre Título/Subtítulo(`contextLabel`) — la barra de progreso de
Commitment se muestra solo si `commitmentProgressRatio` existe (elemento adicional, no parte de la
estructura de 3 líneas). Nunca hay una rama visual distinta por origen.

## 4. TaskForm — selector unificado "Relacionado con"

Un solo bloque, disponible en **crear y editar** (cierra el gap de edición encontrado arriba):
`Ninguno / Goal / Commitment` → sub-selector dependiente. En edición, si el valor cambia, se llama
`relinkGoal`/`relinkCommitment` (mutación separada de `edit()`, secuencial — no `Promise.all`, ver
lección de hoy sobre demo-mode). Reutiliza `ControlledSelect`/patrón `NO_GOAL_VALUE` ya construido.

## 5. Goal Workspace

`linkedTasks` (línea 55-58) se corrige a `tk.goalId === goalId || (tk.commitmentId && goal.commitmentIds.includes(tk.commitmentId))`.
Botón "Agregar tarea" junto al ya existente "Agregar hábito", mismo patrón de precarga
(`?prefillGoalId=`). `TasksScreen` gana el mismo manejo de query param que ya tiene para
`taskId` deep-link, pero para abrir el formulario de creación con el Goal precargado.

## 6. Demo Dataset

Añadir: (a) al menos 1 Task con `goalId` directo (sin Commitment), (b) confirmar que ya existen
tasks independientes (sin ninguno), (c) verificar/ajustar un escenario donde el score haga ganar a
una tarea sin Commitment en Today — para verificación visual real, no solo por soporte del
algoritmo. `DEMO_DATASET.md` se actualiza con la nueva relación.

## 7. Checkpoint obligatorio al cerrar esta fase

Antes de dar Fase 2 por cerrada, el checkpoint debe responder explícitamente: componentes
eliminados, código que dejó de duplicarse, wiring nuevo agregado, % real del dominio de Tasks
terminado, qué queda pendiente para después (ej. auditoría de concurrencia del backend real,
Coach/Insights awareness de Task↔Goal directo).

## Riesgos

Bajo-medio (subió de v1.0.0 por el gap de relink-Commitment encontrado). Todo el patrón
(agregado→evento→CQRS→picker) ya está probado end-to-end con Habit hoy; lo nuevo es el scoring
(función pura, testeable de forma aislada) y el invariante mutuo goalId/commitmentId en el
agregado.
