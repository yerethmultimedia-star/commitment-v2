# Milestone Domain Assessment

**Estado:** Documento de evaluación (no una ADR). Abierto durante la revisión de Goal Backend Fase
4 (`docs/03-architecture/goal_view_alignment_assessment.md`), que redujo el problema de alineación
entre la UI móvil y `GoalView` a un único punto pendiente: Milestone. Este documento responde una
sola pregunta — **¿qué representa un Milestone en el dominio, no en la UI?** — y termina con una
recomendación. Solo si la conclusión requiere introducir un concepto de dominio nuevo (una
subentidad con comandos/eventos propios) se abriría una ADR para formalizarlo.

---

## 1. Las tres opciones

- **A — Subentidad del agregado `Goal`.** Milestones son parte del estado de `Goal`, con sus
  propios comandos (`AddMilestone`/`RenameMilestone`/`CompleteMilestone`/`RemoveMilestone`) y
  eventos, igual que `linkCommitment`/`linkHabit` ya funcionan.
- **B — Proyección derivada.** Milestones no son estado real — se calculan a partir de Commitments/
  Habits/progreso y la UI los presenta como una vista compuesta. `toggleMilestone` nunca debió
  existir como comando.
- **C — Funcionalidad de producto aún no implementada.** El frontend adelantó una experiencia con
  un modelo temporal (dataset demo) que el dominio nunca terminó de incorporar. Ni A ni B están
  decididos todavía — falta terminar el trabajo, no elegir entre dos diseños ya completos.

---

## 2. Evidencia

### A favor de A (subentidad real)

- El propio comentario de `Goal.ts` (packages/domain/src/goal/aggregate/goal.ts`) declara la
jerarquía prevista explícitamente: *"Goal -> Commitment -> Task/Habit, plus **Goal -> Habit/
Milestone directly**"* — Milestone aparece en la misma frase que Habit, que sí se implementó como
relación de primera clase (`linkHabit`, `GoalHabitLinkedEvent`). Este comentario fue citado de
forma independiente durante la investigación de ADR-019 (`adr_019_commitment_user_model.md`,
  hallazgo 3) como evidencia de que "el dominio está bien diseñado" — es la visión original del
  agregado, no una interpretación de este documento.
- Un Milestone en el dataset demo tiene identidad propia (`id`), pertenece a exactamente un Goal
  (`goalId`), tiene estado mutable (`completed`) y opcionalmente una fecha objetivo — la forma
  típica de una subentidad con ciclo de vida propio, no de un valor calculado.

### En contra de A / a favor de C

- `milestone.model.ts` (el mismo archivo que define el shape) es explícito en su propio comentario:
  _"Plain read-model shape, not a DDD aggregate... has no independent lifecycle worth modeling as
  an aggregate yet."_ — una declaración de que la decisión fue explícitamente diferida, no tomada
  a favor de A.
- **La UI de Milestones está incompleta de una forma reveladora.** `GoalWorkspaceScreen.tsx`'s tab
  "milestones" solo permite `toggleMilestone` (marcar/desmarcar) sobre milestones ya sembrados en
  el dataset demo — no existe ningún flujo de creación ni eliminación de Milestones en toda la
  aplicación. Si Milestone hubiera sido diseñado deliberadamente como una subentidad completa
  (Opción A), esperaríamos el mismo patrón CRUD que tienen Commitment/Task/Habit/Goal. En cambio,
  tiene exactamente la mitad: lectura + un solo toggle, sin alta ni baja.
- **El mismo tab tiene hermanos igual de incompletos.** Las secciones "Notes", "Attachments" y
  "Activity" del mismo `GoalWorkspaceScreen.tsx` están permanentemente vacías — ni siquiera en modo
  demo tienen datos, solo el string de estado vacío (`notesEmpty`/`attachmentsEmpty`/
  `activityEmpty`), sin ninguna interacción posible. Milestones es la única de las cuatro secciones
  de esta pantalla que recibió _alguna_ interactividad — el resto quedó como placeholder puro. Esto
  sugiere una pantalla construida por adelantado (Phase 5 — Goals Workspace) con secciones a
  distintos niveles de terminación, no un diseño de dominio completo del que solo faltó la
  conexión al backend.
- **Nota relacionada, no evaluada aquí:** la sección "Activity" de ese mismo tab está vacía a pesar
  de que Goal **ya tiene** un endpoint real de historial (`GET /goals/:id/history`, Fase 3). Ambas
  cosas — Activity y Milestones — apuntan al mismo patrón: la pantalla se adelantó, el backend
  llegó después, y la conexión entre ambos quedó pendiente. Fuera de alcance de este documento,
  pero registrado como la misma familia de brecha.

### Sobre B (proyección derivada)

- No hay evidencia de que Milestones deban calcularse a partir de Commitments/Habits — a diferencia
  de `progress`/`targetDate` (que sí tienen ese patrón confirmado, ver
  `goal_view_alignment_assessment.md`), un Milestone del dataset demo es una entidad con su propio
  título y estado, no una vista compuesta de otras entidades. `computeGoalProgress()` **consume**
  milestones como input (`{completed: boolean}[]`), no los deriva — la dirección del cálculo va al
  revés de lo que propondría la Opción B.
- Si Milestones fueran puramente derivados, `toggleMilestone` no tendría sentido como mutación —
  pero si existiera un query real, seguiría necesitando algún origen de datos con estado propio del
  que derivar. B requeriría inventar ESE origen, lo cual termina pareciéndose a A de todos modos.

---

## 3. Conclusión

La evidencia apunta más a **C que a A o B como diseños ya completos.** Milestone no es una
proyección derivada (no hay de qué derivarla) y tampoco es una subentidad completamente diseñada
(le falta la mitad de su propio ciclo de vida — crear/eliminar — y comparte pantalla con otras tres
secciones igual de incompletas). Es, con más precisión, un concepto que el dominio **dejó
explícitamente abierto** (`milestone.model.ts` lo dice con esas palabras) mientras el frontend
avanzaba con una experiencia de usuario que necesitaba mostrar _algo_ en esa pestaña.

Esto no resuelve si el destino final es A o B — pero sí resuelve la pregunta operativa de esta
fase: **no hay una subentidad ya diseñada esperando ser conectada.** Construir comandos de
backend para Milestone ahora sería diseñar el concepto por primera vez, no espejar un patrón ya
decidido (a diferencia de Fases 1-3, donde el patrón de Commitment ya existía y solo había que
replicarlo).

---

## 4. Recomendación

**No introducir Milestone en el backend como parte de la Fase 4.** No es una decisión de "A vs. B"
todavía — es reconocer que ninguna de las dos está lista para implementarse sin antes decidir qué
significa un Milestone completo para el producto (¿tiene responsable? ¿notas? ¿historial propio?
¿puede el usuario crear los suyos, o siempre vienen de una plantilla?). Esas preguntas son de
producto, no de arquitectura, y deberían responderse antes de que cualquier ADR tenga sentido.

**Alcance recomendado para esta fase:**

- Pausar únicamente `toggleMilestone` y la pestaña "Milestones" de `GoalWorkspaceScreen.tsx` —
  sigue apuntando al repositorio demo (o se deshabilita temporalmente, decisión de producto sobre
  qué experiencia ofrecer mientras tanto), sin bloquear el resto de la pantalla ni del Goal real.
- El resto de Fase 4 (`list`/`getById`/`create`, adaptar `progress`/`targetDate` a cálculo real,
  remover la dependencia de `category`/`priority`) puede avanzar sin esperar esta decisión — no
  depende de ella.
- Cuando el producto decida qué debe ser un Milestone completo, abrir la investigación de diseño
  correspondiente entonces — y recién ahí, si la conclusión introduce un concepto de dominio nuevo,
  una ADR.
