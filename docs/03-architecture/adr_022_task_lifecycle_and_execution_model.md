# 🏛️ ADR-022: Task Lifecycle & Execution Model

**Estado:** ✅ **Implementada** (2026-07-19). Fase 1 (diseño, 2026-07-18) → Fase 2.1 Dominio
(2026-07-18) → Fase 2.2 Aplicación + Backend (2026-07-19, aprobada sin desviaciones) → Fase 2.3
Frontend (2026-07-19) — las tres fases de implementación completas y verificadas mediante recorrido
funcional en vivo (backend vía `curl` contra un servidor real, frontend vía Playwright contra un
build web real en Modo Demo). Checklist de migración frontend, completo:
`docs/03-architecture/task_frontend_migration_checklist.md`. 🔒 DOCUMENTO CONGELADO — cambios futuros
al modelo de lifecycle de Task requieren una ADR nueva, no una edición de esta.

---

## Contexto

Esta ADR nace de la convergencia de tres hilos abiertos en sesiones anteriores, no de una única
pregunta aislada:

1. **V-001 (`TECH_DEBT.md` Item 38) cerró con un alcance deliberadamente reducido.** `TaskStatusBadge`
   se implementó solo para los 3 estados que el dominio de `Task` soporta hoy
   (`pending`/`completed`/`archived`, ver `packages/domain/src/task/value-objects/task-status.ts`).
   Un conjunto de 6 estados (Pending/In Progress/Blocked/Deferred/Cancelled/Completed) había sido
   propuesto originalmente, pero se descartó construirlo sin definición de transiciones, eventos o
   invariantes — quedó registrado como **"Task Lifecycle Expansion"**, candidato en
   `PROJECT_STATUS.md` (item 14), sin ADR propia hasta ahora.
2. **La Decisión A del hilo Draft Lifecycle UX (Commitment Draft Lifecycle) quedó con un invariante
   deliberadamente sin implementar.** `Commitment.activate()` solo exige descripción — el requisito
   "al menos una Task o Habit vinculada" fue evaluado y rechazado en su forma original porque
   forzaba al agregado `Commitment` a consultar los repositorios de `Task`/`Habit`, rompiendo el
   límite del agregado y exigiendo una dependencia circular entre `CommitmentModule` y `TaskModule`
   (`TaskModule` ya importa `CommitmentModule`, no al revés). Ver
   `project_commitment_aggregate_boundary_lesson.md` para el principio completo. El código dejó un
   TODO explícito en `Commitment.activate()` esperando exactamente esta ADR.
3. **El dominio de `Task` fue diseñado originalmente como una entidad de checklist simple**
   (`Pending → Completed`, más `Archived` como estado de "oculto/soft-delete", ver
   `packages/domain/src/task/aggregate/Task.ts`). El producto ya superó ese modelo — Coach, Insights
   y el propio Goal Workspace tratan a `Task` como la capa de ejecución real del sistema, no como un
   checklist. El modelo de dominio no había sido actualizado para reflejar eso.

Esta ADR resuelve los tres hilos a la vez porque están genuinamente acoplados: el ciclo de vida de
Task determina qué significa "tener un plan de ejecución" para Commitment, y ambos determinan cómo
se organiza la navegación de Goal Workspace.

### Concepto central de esta ADR

**La distinción entre Planning Aggregates y Execution Aggregates (sección 1) es la idea que explica
prácticamente todo lo demás en este documento** — las reglas de activación, el ciclo de vida de
Task, y hasta la jerarquía de navegación de Goal Workspace son consecuencias directas de esa
distinción, no reglas independientes. Se coloca primero deliberadamente por eso.

---

## 1. Modelo conceptual: Planning Aggregates vs. Execution Aggregates

El dominio se divide formalmente en dos familias, con semánticas de ciclo de vida distintas por
diseño, no por accidente histórico:

|                       | **Planning Aggregates**                                                                 | **Execution Aggregates**                                                                      |
| --------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Miembros              | `Goal`, `Commitment`                                                                    | `Task`, `Habit`                                                                               |
| Responsabilidad       | Planificación — definen _qué_ se quiere lograr y _cómo_ se piensa organizar el esfuerzo | Ejecución — representan trabajo real, medible, que ocurre en el tiempo                        |
| ¿Tiene `Draft`?       | Sí — ambos empiezan en `Draft` y requieren una activación explícita y consciente        | No — `Task`/`Habit` no tienen fase de "diseño"; existen para ejecutarse desde su creación     |
| ¿Requiere activación? | Sí, con invariantes propias verificadas antes de permitir `Active`                      | No aplica — su ciclo de vida es operativo (`Pending`/`In Progress`/etc.), no de planificación |

Esta distinción ya era el patrón implícito de Goal Lifecycle y Commitment Draft Lifecycle
(implementados en sesiones anteriores); esta ADR la hace explícita y la extiende formalmente a
`Task`, dejando `Habit` fuera de cualquier cambio de esta ADR (su ciclo de vida —
`Active`/`Disabled`/`Archived`, sin `Draft`— ya es consistente con "Execution Aggregate" tal cual
existe hoy; no requiere modificación).

### 1.1 — Capacidades ortogonales al lifecycle (aclaración necesaria para que esta tabla no se rompa)

Un Execution Aggregate como `Task` va a acumular, con el tiempo, capacidades como prioridad,
etiquetas, recordatorios, adjuntos o comentarios. **Ninguna de estas es, ni debe convertirse jamás
en, un estado del lifecycle.** Son atributos del agregado, ortogonales a su estado — un Task puede
estar `In Progress` y tener prioridad alta, o estar `Blocked` y tener un comentario nuevo, sin que
eso afecte cuál de los 5 estados oficiales (sección 4.1) ocupa.

Esta aclaración existe para prevenir un error concreto y predecible: que en el futuro alguien
proponga agregar estados como `Waiting`, `Flagged` o `Urgent` al lifecycle cuando en realidad son
atributos (`priority: 'urgent'`, `flagged: true`) que ya tienen un lugar natural fuera de la máquina
de estados. Cualquier propuesta futura de un nuevo "estado" de `Task` debe evaluarse primero contra
esta pregunta: **¿esto describe una fase distinta de ejecución del trabajo, o es un atributo que
puede coexistir con cualquier fase?** Si es lo segundo, no es un estado.

No se implementa nada de esta sección ahora — es una nota arquitectónica preventiva, no una lista de
trabajo pendiente.

---

## 2. Relaciones entre agregados

Confirmado contra el código actual, no asumido:

- **`Goal`** puede existir sin `Commitment`s vinculados (`_commitmentIds: []` en `Draft`).
  `Active` requiere **≥1 Commitment** — invariante ya implementado dentro del propio agregado
  (`Goal._commitmentIds.length === 0` → `GoalActivationRequirementsNotMetError`), sin problema de
  límites de agregado porque `Goal` ya es dueño de esa lista (`linkCommitment()`).
- **`Commitment`** puede existir sin `Goal` (relación opcional, dueña del lado `Goal`, no de
  `Commitment` — ADR-021). `Draft` puede quedar vacío indefinidamente. `Active` requiere:
  - descripción (ya implementado, invariante propio del agregado);
  - **≥1 Task o Habit** representando un plan de ejecución concreto — este es el invariante que
    quedó pendiente y que esta ADR resuelve arquitectónicamente (sección 3).
- **`Task`** puede existir sin `Commitment` — `commitmentId` es opcional (ya así hoy:
  `Task._props.commitmentId: CommitmentId | null`). Una Task "huérfana" (sin Commitment) es un caso
  válido, no un error — igual que hoy.
- **`Habit`** puede existir sin `Commitment` — hoy `Habit` solo se relaciona con `Goal`
  (`Habit.goalId`), nunca con `Commitment`. Esta ADR no introduce una relación
  `Habit`↔`Commitment` nueva — ver sección 3.1 para cómo el invariante de Commitment maneja esto
  mientras esa relación no exista (deferido a una ADR futura, no bloqueante — ver sección 12).

---

## 3. Command Preconditions (Application Layer)

**Decisión:** las reglas de un comando que dependen de datos de _otro_ agregado no se implementan
dentro del agregado que recibe el comando. Se implementan como **Command Preconditions** — clases de
la capa de aplicación (`apps/backend/src/<contexto>/application/preconditions/`), responsables
únicamente de **resolver hechos externos**, nunca de decidir la transición de estado por sí mismas.

Se renombra deliberadamente de "Activation Policy" (nombre usado en el borrador original de esta
ADR) a **"Command Preconditions"** porque no es una política configurable — es un conjunto fijo de
precondiciones que deben cumplirse para que un comando específico tenga éxito. El patrón tiene dos
instancias en esta ADR, no una: precondiciones de activación (Commitment) y precondiciones de
reapertura (Task, sección 6.1).

**Regla de oro, sin excepción:** el agregado sigue siendo quien decide si la transición es válida y
quien lanza la excepción de dominio — esto preserva la Regla #86 ya establecida en este código
("Invoke domain behavior — let the Aggregate decide validity", ver cualquier `*.handler.ts`
existente). Una Precondition nunca reemplaza esa decisión; solo le entrega al agregado un hecho que
el agregado no podía conocer por sí mismo.

```
ActivateCommitmentCommand
        ↓
CommitmentActivationPreconditions   (resuelve hechos externos)
        ↓
commitment.activate(hasExecutionPlan)   (el agregado decide y lanza el error)
```

### 3.1 — `CommitmentActivationPreconditions`

```
CommitmentActivationPreconditions.hasExecutionPlan(commitmentId: CommitmentId): Promise<boolean>
```

Implementación: consulta `TaskRepository` (¿existe alguna `Task` no cancelada con `commitmentId`
igual al del Commitment?). Para Habits: **no se puede consultar todavía** — `Habit` no tiene hoy
ninguna relación con `Commitment` (solo con `Goal`), y esta ADR no construye esa relación (sería una
abstracción nueva no pedida). **Decisión explícita, no bloqueante:** por ahora,
`hasExecutionPlan()` evalúa únicamente la mitad "Task" del requisito original ("≥1 Task o Habit").
La relación `Habit`↔`Commitment` queda como candidata a una **ADR-023** futura, sin bloquear esta
implementación — ver sección 12.

**`ActivateCommitmentCommandHandlerCore` (`apps/backend/src/commitment/application/commands/
activate-commitment.handler.ts`) se modifica así:**

```
1. Cargar Commitment (ya existe)
2. preconditions.hasExecutionPlan(commitmentId)   ← nuevo paso
3. commitment.activate(hasExecutionPlan)          ← el agregado sigue lanzando el error si es false
4. Persistir / despachar eventos (sin cambios)
```

`Commitment.activate()` cambia su firma de `activate(): void` a `activate(hasExecutionPlan:
boolean): void` — sigue siendo el agregado quien decide y lanza
`CommitmentActivationRequirementsNotMetError` si `hasExecutionPlan` es `false`, exactamente igual
que hoy decide sobre su propia descripción. El agregado nunca importa ni conoce `TaskRepository`;
solo recibe un booleano, como cualquier otro parámetro de comando.

### 3.2 — Resolución arquitectónica: cómo evitar la dependencia circular

El problema original seguía existiendo incluso moviendo la lógica a una clase de Preconditions:
**¿en qué módulo de NestJS vive `CommitmentActivationPreconditions`, si necesita `TaskRepository`
pero `CommitmentModule` no puede importar `TaskModule` sin crear un ciclo** (`TaskModule` ya hace
`imports: [CommitmentModule, HabitModule]`)?

**Resolución — sin `forwardRef()`, sin patrón nuevo:** el mismo patrón que ya usa `GoalModule` para
reutilizar el `DomainEventDispatcher` de `CommitmentModule` (`imports: [CommitmentModule]`, sin que
`CommitmentModule` necesite saber que `GoalModule` existe). Aplicado aquí: dado que `TaskModule`
**ya** importa `CommitmentModule` (dirección correcta, sin ciclo), el `ActivateCommitmentNestjsHandler`
— el adaptador de NestJS/CQRS, no la lógica de negocio — se **registra dentro de `TaskModule`** en
lugar de `CommitmentModule`. El `Command`, el `Result`, y el `ActivateCommitmentCommandHandlerCore`
(la lógica pura, sin NestJS) siguen viviendo en `commitment/application/commands/` exactamente donde
están hoy — no se mueven, no cambian de carpeta. Solo el archivo de wiring
(`activate-commitment.nestjs-handler.ts`, y su registro en `providers:`) se relocaliza. El endpoint
HTTP (`POST /commitments/:id/activate`) sigue existiendo en `CommitmentsController`, sin cambios
visibles para el cliente.

Esto no es una invención — es exactamente el mismo principio que ya se aplicó para el
`DomainEventDispatcher` compartido: el módulo que aloja la clase concreta no tiene que coincidir con
el contexto de dominio al que pertenece conceptualmente el comando, siempre que la capa de
aplicación (Command/Handler-Core) se mantenga desacoplada de NestJS.

### 3.3 — `GoalActivationPreconditions` — aclaración, no se construye

El invariante de `Goal` (`≥1 Commitment`) **no necesita** una clase de Preconditions real: `Goal` ya
es dueño de `_commitmentIds[]` localmente (`linkCommitment()` ya lo llena, ADR-021). No hay datos
externos que resolver — el chequeo ya vive, correctamente, dentro del propio agregado desde que se
implementó Goal Lifecycle. Introducir una clase `GoalActivationPreconditions` que simplemente
reenvíe una llamada al propio agregado sería una abstracción sin propósito (`Do NOT invent
abstractions`, regla vigente de este proyecto). **Propuesta: no construir esta clase.** El patrón
"Command Preconditions" se reserva para reglas que genuinamente cruzan agregados — hoy, la de
activación de `Commitment` (sección 3.1) y la de reapertura de `Task` (sección 6.1).

---

## 4. Task Lifecycle

### 4.1 — Estados oficiales

```
Pending
In Progress
Blocked
Completed
Cancelled
```

`Archived` **se elimina** del dominio de `Task`. `Deferred` **nunca se agrega** (era parte del
conjunto de 6 estados original, descartado ya en V-001).

**Esto es un cambio disruptivo, no aditivo.** Eliminar `Archived` implica:

- Remover `StatusType.Archived`, `Task.archive()`, `Task.restore()`,
  `TaskArchivedEvent`/`TaskRestoredEvent`, y los comandos backend
  `archive-task.{command,handler}.ts`/`restore-task.{command,handler}.ts`.
- Migrar `TasksScreen.tsx`: el bucket "Archivadas" y el botón "Archivar" dejan de tener sentido tal
  como existen — Fase 2 decide su reemplazo concreto en la UI, pero el estado subyacente ya queda
  resuelto (ver migración de datos abajo).
- Actualizar `TaskStatusBadge.tsx` (creado en V-001) — pierde el caso `archived`, gana
  `inProgress`/`blocked`/`cancelled`.
- **Migración de datos — RESUELTO:** toda `Task` con `status: 'archived'` se reinterpreta como
  `Cancelled` durante la migración. No se preserva un estado legado de solo lectura — `Cancelled` ya
  cubre semánticamente "esto no va a completarse," que es lo que `Archived` representaba en la
  práctica.

### 4.2 — Acciones y reglas por estado

**Disponibilidad de `Edit` — RESUELTO:** editable desde cualquier estado _operativo_ (`Pending`,
`In Progress`, `Blocked`). No editable desde `Completed` ni `Cancelled` (estados terminales).

**`Pending`** (estado inicial — sin cambio respecto a hoy):

- `Start` → `In Progress`
- `Complete` → `Completed` (permite saltar `In Progress`)
- `Block` → `Blocked`
- `Cancel` → `Cancelled`
- `Edit`
- `Postpone` (reutiliza `Task.schedule()` existente para mover `dueDate` — Task no tiene un
  componente de "hora del día" hoy, así que esto no invoca la regla de Time Selection de
  `PROJECT_STATUS.md` item 15; si en el futuro Task necesita una hora específica, esa es una ADR
  separada, no bloqueante — ver sección 12)

**`In Progress`** (alcanzable _solo_ mediante `Start` — nunca automático):

- `Complete` → `Completed`
- `Block` → `Blocked`
- `Cancel` → `Cancelled`
- `Return to Pending`
- `Edit`

**`Blocked`**:

- Se alcanza desde `Pending` o `In Progress` mediante `Block`.
- Origen: `blockedType: 'manual' | 'dependency'` (campo obligatorio), `blockedReason?: string`
  (opcional).
- **`Unblock` — regla de desbloqueo diferenciada por origen (RESUELTO):**
  - `blockedType: 'manual'` → el usuario puede desbloquear manualmente en cualquier momento.
  - `blockedType: 'dependency'` → **el usuario NO puede desbloquear manualmente.** Solo la
    resolución de la dependencia bloqueante (la Task predecesora alcanzando `Completed`) puede
    desbloquear. Esto responde también la pregunta abierta original sobre si el bloqueo por
    dependencia es automático: **sí, tanto el bloqueo como el desbloqueo por dependencia son
    automáticos, nunca una acción manual del usuario** — evita el estado inconsistente de un
    usuario "resolviendo" manualmente un bloqueo cuya causa real (la dependencia) sigue sin
    completarse.
  - En ambos casos, al desbloquear se regresa al estado **previo exacto** (`Pending` si venía de
    `Pending`, `In Progress` si venía de `In Progress`) — requiere que el agregado recuerde el
    estado anterior al bloqueo (campo interno, ej. `_preBlockStatus`, no expuesto como estado
    público).
- `Cancel` → `Cancelled` (disponible incluso bloqueada — cancelar es siempre una acción manual
  válida, a diferencia de desbloquear).
- `Edit`

**`Completed`** (terminal):

- Sin transiciones salientes excepto `Reopen` (sección 4.4, con la restricción de la sección 6.1).

**`Cancelled`** (terminal):

- Sin transiciones salientes excepto `Reopen` (sección 4.4, con la restricción de la sección 6.1).

### 4.3 — Diagrama de transiciones (resumen exhaustivo, no parcial)

```
Pending      → In Progress   (Start)
Pending      → Completed     (Complete — sin pasar por In Progress)
Pending      → Blocked       (Block)
Pending      → Cancelled     (Cancel)
In Progress  → Completed     (Complete)
In Progress  → Blocked       (Block)
In Progress  → Cancelled     (Cancel)
In Progress  → Pending       (Return to Pending)
Blocked      → Pending       (Unblock manual, solo si blockedType='manual' y el estado previo era Pending)
Blocked      → In Progress   (Unblock manual, solo si blockedType='manual' y el estado previo era In Progress)
Blocked      → Pending       (Unblock automático, solo si blockedType='dependency' se resuelve y el estado previo era Pending)
Blocked      → In Progress   (Unblock automático, solo si blockedType='dependency' se resuelve y el estado previo era In Progress)
Blocked      → Cancelled     (Cancel)
Completed    → Pending       (Reopen, solo si el Commitment vinculado sigue Active o no tiene Commitment — sección 6.1)
Cancelled    → Pending       (Reopen, misma restricción)
```

Ninguna transición regresa automáticamente a `In Progress` — siempre requiere una acción explícita
del usuario, sin excepción (incluyendo `Reopen`, que siempre aterriza en `Pending`, nunca en
`In Progress`).

### 4.4 — Reopen

Un único comando `ReopenTask`, válido desde `Completed` **o** `Cancelled`, siempre resulta en
`Pending`. Reutiliza el nombre y la forma ya existente de `Task.reopen()` (hoy solo válido desde
`Completed`) — se **extiende**, no se reemplaza, para aceptar también `Cancelled` como origen
válido, y se restringe adicionalmente con la precondición de la sección 6.1.

**Evento — RESUELTO, requisito explícito, no implementación libre:** la reapertura despacha
`TaskReopenedEvent`, distinto de `TaskCompletedEvent`/`TaskCancelledEvent`. Esto ya existe hoy en
parte (`task.reopened` para el caso `Completed → Pending`) — se reutiliza el mismo evento también
para el caso `Cancelled → Pending`, sin crear un segundo tipo de evento. La razón de negocio,
explícita: para analítica, una Task que fue `Completed → Reopened → Completed` de nuevo es una señal
distinta de una Task que fue `Completed` una sola vez sin retrabajo — perder esa distinción (por
ejemplo, si `reopen()` no emitiera ningún evento propio) haría indistinguibles ambos casos en
cualquier métrica futura de calidad de planificación.

---

## 5. Dependencies (preparación de dominio, V1)

**Cambio respecto al borrador original de esta ADR — RESUELTO:** no se modela como un array
(`dependsOnTaskIds: TaskId[]`). Se modela como una **entidad de relación de primera clase**:

```
TaskDependency
  id: string
  predecessorTaskId: TaskId
  successorTaskId: TaskId
  createdAt: Date
```

**Razón:** un array de IDs solo puede crecer agregando más IDs — no tiene dónde guardar atributos
propios de la relación. Es previsible que este modelo necesite, en el futuro, campos como tipo de
dependencia (Finish-to-Start, Start-to-Start), si es obligatoria u opcional, o un porcentaje de
avance requerido del predecesor. Modelar la relación como entidad desde V1 evita una migración de
datos disruptiva más adelante — el costo de hacerlo bien ahora es marginal comparado con
`dependsOnTaskIds[]`. **Ninguno de esos campos futuros (tipo, obligatoriedad, porcentaje) se
implementa en esta fase** — la entidad nace con exactamente los 4 campos de arriba; se menciona la
dirección de crecimiento únicamente para justificar por qué es una entidad y no un array, no como
trabajo pendiente de esta ADR.

- Relación exclusivamente `Task → Task` (vía `TaskDependency`). Explícitamente prohibido:
  `Task → Habit`, `Task → Goal`, `Task → Commitment`.
- Invariante de dominio: prohibir ciclos (A depende de B, B depende de A — directo o transitivo).
  La verificación de ciclos recorre el grafo de `TaskDependency` ya cargado — responsabilidad de un
  `TaskDependencyService` de dominio puro (sin I/O) en la capa de aplicación, mismo tipo de
  componente que las Command Preconditions pero sin necesitar consultar otro Bounded Context (todo
  el grafo es de `Task`s).
- **Alcance explícito de Fase 2 para esta sección:** solo la entidad `TaskDependency`, su
  persistencia mínima, y la invariante anti-ciclo. No se construye UI de edición de dependencias, ni
  editor visual. El disparo automático de `Blocked(dependency)` cuando una Task predecesora está
  incompleta **sí queda confirmado como comportamiento esperado** (sección 4.2 ya lo resuelve: el
  bloqueo y desbloqueo por dependencia son ambos automáticos) — lo que no se implementa todavía es
  la UI para que un usuario cree o visualice esas dependencias manualmente; el comportamiento de
  bloqueo automático debe funcionar igual aunque la única forma de crear una `TaskDependency` en
  Fase 2 sea vía comando/API directa, sin pantalla propia.

---

## 6. Integración Commitment → Task

### 6.1 — Cascada de cancelación al completar un Commitment

Cuando un `Commitment` se completa (`CommitmentCompletedEvent`, ya existe y se despacha hoy), todas
sus `Task`s vinculadas (`Task.commitmentId === commitment.id`) deben transicionar así:

```
Pending     → Cancelled
In Progress → Cancelled
Blocked     → Cancelled
Completed   → Completed   (sin cambio — ya está en estado terminal correcto)
Cancelled   → Cancelled   (sin cambio — idempotente)
```

**Mecanismo:** un nuevo event handler (`CancelTasksOnCommitmentCompletedHandler` o nombre
equivalente) suscrito a `CommitmentCompletedEvent`, viviendo en `TaskModule` (que ya importa
`CommitmentModule`, sin problema de dirección). Mismo patrón ya usado extensamente en
`apps/backend/src/notifications/application/handlers/` (ej.
`cancel-reminder-on-terminal-state.handler.ts`, `suspend-reminder-on-pause.handler.ts`) — reacciones
de un módulo a eventos de otro vía el `DomainEventDispatcher` ya existente. No es un patrón nuevo.

**La cancelación debe preservar historial — nunca `delete()`.** El comando `Task.delete()` ya
existe y es semánticamente distinto (soft-delete real); esta cascada usa la transición de estado
`Cancel`, que sigue siendo consultable en el historial de eventos de cada Task individual.

### 6.2 — Restricción de Reopen contra el estado del Commitment — NUEVA REGLA

**Problema identificado en revisión:** sin esta regla, la cascada de 6.1 puede deshacerse de forma
inconsistente — `Commitment` se completa (cancela sus Tasks vía cascada), y después alguien reabre
una de esas Tasks individualmente, resucitando trabajo que pertenece a un Commitment ya cerrado.

**Regla:** una `Task` no puede reabrirse (`ReopenTask`) si su `Commitment` vinculado ya no está en
estado `Active`. Una `Task` sin `Commitment` vinculado (`commitmentId: null`) nunca tiene esta
restricción — siempre puede reabrirse libremente.

**Mecanismo — mismo patrón que la sección 3, nueva instancia:** esta regla también depende de datos
de otro agregado (`Task` necesita conocer el estado actual de su `Commitment`), así que se resuelve
igual que el invariante de activación de Commitment — con una clase de **Command Preconditions**:

```
TaskReopenCommand
        ↓
TaskReopenPreconditions.commitmentAllowsReopen(task): Promise<boolean>
        ↓
task.reopen(commitmentAllowsReopen)   (el agregado sigue decidiendo y lanzando el error)
```

`TaskReopenPreconditions.commitmentAllowsReopen(task)`: si `task.commitmentId` es `null`, devuelve
`true` sin consultar nada. Si no es `null`, consulta `CommitmentRepository` y devuelve `true` solo
si `commitment.state === Active`.

**Nota arquitectónica — dirección de dependencia trivial en este caso, a diferencia de la sección
3.2:** aquí no hay problema de módulo circular. `TaskModule` **ya** importa `CommitmentModule` (la
dirección correcta), así que `TaskReopenPreconditions` puede vivir directamente dentro de
`TaskModule` y usar `CommitmentRepository` sin ninguna reubicación especial — a diferencia del caso
de `CommitmentActivationPreconditions` (sección 3.2), que sí necesitó relocalizar el handler porque
iba en la dirección contraria a la ya establecida. Esta asimetría es un buen recordatorio de por qué
la dirección de las dependencias entre módulos importa: la misma clase de problema (agregado A
necesita un hecho del agregado B) es trivial en una dirección y requiere resolución arquitectónica
explícita en la otra.

---

## 7. Integración Goal → Commitment

Ya implementado (`Goal.activate()`, sesión anterior) — `Active` requiere `≥1 Commitment`, chequeo
local, sin clase de Preconditions nueva (ver sección 3.3). Esta ADR no cambia nada aquí; se
documenta por completitud, no porque requiera trabajo.

---

## 8. Navegación: Goal Detail tabs

**Propuesta de tabs para `GoalWorkspaceScreen.tsx`:**

```
Overview → Commitments → Tasks → Analytics
```

**No son 4 pestañas independientes — son niveles de abstracción, en orden explícito, y deben
documentarse y construirse como tal (RESUELTO, requisito explícito de esta revisión):**

- **Overview**: resumen del Goal en sí — progreso agregado, descripción, fecha objetivo. El nivel
  más alto de abstracción.
- **Commitments**: la capa de planificación scopeada a este Goal — qué Commitments existen, en qué
  estado de su propio lifecycle (Draft/Active/Paused/Completed/Cancelled).
- **Tasks**: la capa de ejecución scopeada a este Goal — debe mostrar **todas** las `Task`s
  pertenecientes a **cualquier** `Commitment` asociado al Goal (transitividad Goal → Commitment →
  Task). **No** debe mostrar Tasks independientes (sin `commitmentId`), ni Tasks vinculadas
  directamente a otro Goal. Desde esta pestaña: crear, editar, cambiar estado, buscar, filtrar,
  ordenar Tasks. Al crear una Task desde aquí, `Commitment` es opcional — si el Goal tiene
  Commitments, mostrar un selector que incluya explícitamente la opción **"No Commitment"** (mismo
  patrón ya establecido por `ControlledSelect`/`NO_GOAL_VALUE` en `CommitmentForm.tsx`).
- **Analytics**: la vista agregada que consume tanto la capa de planificación como la de ejecución —
  el nivel de abstracción más alto en el sentido de síntesis, no de jerarquía de datos.

La progresión Overview → Commitments → Tasks es literalmente Goal → Commitment → Task, la misma
jerarquía de dominio ya establecida en `Goal.ts`'s propio comentario histórico
(`Goal -> Commitment -> Task/Habit`). La navegación no inventa una jerarquía nueva — expone la que
ya existe en el dominio.

**Milestones y Notes — RESUELTO, fuera de alcance de esta ADR:** no se tocan. Ambas pestañas deben
seguir funcionando exactamente igual que hoy. Esta ADR no decide cómo coexisten visualmente con la
nueva estructura de 4 niveles (¿pestañas adicionales? ¿dentro de Overview?) — esa es una decisión de
UX de Fase 2, no de esta ADR, con una única restricción dura: ninguna funcionalidad de Milestones o
Notes que exista hoy puede perderse ni degradarse como efecto colateral de este rediseño.

---

## 9. UX — reutilización obligatoria

Ningún componente nuevo. Reutilizar diálogos, sheets, selectores ya existentes — mismo principio ya
aplicado y validado en Goal Lifecycle y Commitment Draft Lifecycle (extender `RenameGoalDialog`
en vez de crear una pantalla nueva fue explícitamente elogiado en la revisión de esa sesión). El
selector de Commitment para crear una Task ("No Commitment" incluido) debe mirar y reutilizar el
patrón ya establecido por `ControlledSelect`/`goalOptions` en `CommitmentForm.tsx` (mismo componente,
mismo patrón "Ninguno" ya usado ahí para el selector de Goal).

---

## 10. Arquitectura — restricciones (sin cambios respecto al resto del proyecto)

- DDD, CQRS, Application Layer, Repositories, Value Objects, Aggregates — sin alteración del
  patrón ya establecido por Commitment/Task/Habit/Goal.
- Sin dependencias circulares, sin `forwardRef()` (resuelto en secciones 3.2 y 6.2).
- Sin romper límites de agregado (resuelto en sección 3).
- Historial de dominio: `Task` no está conectado hoy al Event Store común de ADR-021 (solo `Goal`
  lo está) — esta ADR no cambia eso. Las nuevas transiciones de Task siguen despachándose vía el
  `DomainEventDispatcher` existente (efectos secundarios), no vía el Event Store — consistente con
  cómo Task ya funciona hoy.

---

## 11. Alcance explícito — qué NO decide ni implementa esta ADR

- No conecta `Task` al Event Store común de ADR-021 — sigue fuera de alcance, tal como está hoy.
- No construye la relación `Habit`↔`Commitment` — candidata a ADR-023, no bloqueante (sección 12).
- No construye UI de edición de dependencias entre Tasks, ni editor visual, ni los campos futuros de
  `TaskDependency` (tipo, obligatoriedad, porcentaje).
- No decide cómo coexisten visualmente las pestañas Milestones/Notes con la nueva estructura de
  navegación — solo garantiza que no pierden funcionalidad.
- No implementa ninguna de las capacidades ortogonales mencionadas en la sección 1.1 (prioridad,
  etiquetas, recordatorios, adjuntos, comentarios) — esa sección es una nota preventiva, no trabajo.
- No es la Fase 2 — este documento, en su redacción, no modifica ningún archivo de código.

---

## 12. Temas deferidos a ADRs futuras — no bloquean Fase 2

Ambos temas fueron revisados explícitamente y el equipo decidió no bloquear la implementación por
ellos:

1. **Relación `Habit`↔`Commitment` (candidata a ADR-023).** Mientras no exista, el invariante de
   activación de Commitment (sección 3.1) evalúa únicamente Tasks. Se documenta como una brecha
   conocida y aceptada, no como un defecto de esta implementación.
2. **¿Necesita `Task` un campo de hora del día (más allá de `dueDate`)?** No confirmado como
   necesario. Si en el futuro se decide que sí, esa decisión activa la regla de Time Selection ya
   corregida (`PROJECT_STATUS.md` item 15: `ControlledDatePicker` mode `time`, nunca
   `DurationWheelPicker`) — pero es una ADR propia, posterior a esta.

---

## 13. Consecuencias

- **Positivas:** cierra formalmente V-001 y la Decisión A de Commitment Draft Lifecycle con una
  sola pieza de arquitectura coherente (Command Preconditions), en vez de dos soluciones ad hoc
  independientes. Establece un patrón reutilizable — ya con dos instancias reales en esta misma ADR
  (activación de Commitment, reapertura de Task) — para cualquier invariante cruzado futuro entre
  agregados, sin comprometer los límites de DDD ya respetados en el resto del proyecto. La entidad
  `TaskDependency` (en vez de un array) evita una migración de datos previsible dentro de un año.
- **Riesgo aceptado:** eliminar `Archived` de `Task` es un cambio disruptivo con superficie amplia
  (backend: 2 comandos + 2 eventos; frontend: bucket completo, badge, botón). Debe ejecutarse como
  su propia fase dentro de la implementación, con la migración de datos ya decidida
  (`Archived → Cancelled`) aplicada explícitamente, no como un cambio incidental.
- **Deuda evitada:** no se introduce ninguna dependencia circular ni patrón de módulo nuevo — tanto
  la reubicación de `ActivateCommitmentNestjsHandler` como la nueva `TaskReopenPreconditions`
  reutilizan el mecanismo ya validado de composición de módulos (`imports:` en la dirección correcta,
  nunca `forwardRef()`).

---

_ADR-022 aprobada. Fase 2 (implementación) puede comenzar siguiendo este documento como
especificación oficial del dominio Task._
