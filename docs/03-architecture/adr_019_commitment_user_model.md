# 🏛️ ADR-019: Commitment User Model

**Estado:** ✅ Aprobada (2026-07-17). Ambas decisiones quedan resueltas tal como se recomendaba:
Decisión 1 = Sí, Decisión 2 = la tabla propuesta. La aprobación se basó explícitamente en la cadena
de evidencia acumulada (ambigüedad de UI → descartado problema de componentes → descartado mismo
agregado → confirmada la jerarquía `Goal -> Commitment -> Task` en el dominio → eliminado el sesgo
del demo dataset → repetido el recorrido real → la ambigüedad persistió → hallada la pantalla
huérfana que ya usaba "Compromiso"), no en una preferencia aislada por el nombre. La implementación
sigue sin empezar — ver "Próximos pasos" al final de este documento para el plan de trabajo
posterior a la aprobación.

---

## Contexto

Esta ADR nace de una investigación que empezó como una pregunta de UI ("¿por qué dos tarjetas de
tarea se ven distintas?") y terminó siendo una pregunta de modelo de producto. Cadena completa,
en orden:

1. **Comparación visual inicial:** dos capturas de pantalla mostraban tarjetas de "tarea"
   estructuralmente distintas — una bajo la pestaña "Tareas" de Goals, otra en la pantalla Tasks.
2. **Primer hallazgo:** `GoalTasksTab.tsx` (la pestaña "Tareas" de Goals) en realidad renderiza
   `Commitment` (`useCommitments()`), no `Task`. Su propio comentario en código confirma que esto
   fue una decisión deliberada de VS-031 ("Labeled 'Tasks' to match how the user thinks about
   commitments"), anterior a que `Task` existiera como entidad propia y protagonista.
   `GoalWorkspaceScreen.tsx` tiene una tercera superficie que mezcla ambos dominios bajo la misma
   etiqueta "Tareas".
3. **Segundo hallazgo, leyendo el dominio directamente:** `Commitment`
   (`packages/domain/src/commitment/aggregate/commitment.ts`) tiene `recurrencePattern`/`seriesId`
   y una máquina de estados con `pause()`/`resume()` — modela un esfuerzo continuo, posiblemente
   recurrente. `Task` (`packages/domain/src/task/aggregate/Task.ts`) tiene
   `estimatedMinutes`/`actualMinutes` y un ciclo de vida simple Pending→Completed — modela una
   acción finita y medible. El comentario propio de `Goal.ts` declara la jerarquía prevista
   explícitamente: `Goal -> Commitment -> Task/Habit, plus Goal -> Habit/Milestone directly`. **El
   dominio está bien diseñado — nunca fue el problema.**
4. **Tercer hallazgo, la causa raíz real:** los títulos sembrados de `COMMITMENT_SEEDS` tenían
   escala de Goal, no de Commitment ("Run a half marathon", "Save for a house down payment"), y los
   títulos de Task nunca fueron específicos — se generaban de una lista genérica compartida por
   categoría, sufijada con el nombre del Commitment padre. El dataset enseñaba el modelo
   equivocado, sin importar qué tan correcto fuera el dominio real. **Corregido el 2026-07-17**
   (`TECH_DEBT.md` RI-13, `docs/03-architecture/DEMO_DATASET.md`) — se reescribieron los 17 títulos
   de Commitment y se les dio a cada uno títulos de Task propios y concretos.
5. **Auditoría de verificación (2026-07-17, con el dataset ya corregido):** se ejecutó el mismo
   tipo de recorrido real que inauguró Product Polish — crear un Goal, leer los Commitments bajo
   "Tareas", intentar crear uno nuevo, volver a Today — para responder una sola pregunta: _¿el
   usuario sigue percibiendo Commitments como "Tareas"?_ **Respuesta confirmada: sí, sigue
   pasando.** Con el dataset corregido, la causa ya no puede ser el dato — es el lenguaje del
   producto.
6. **El hallazgo más severo, surgido al intentar completar el propio recorrido:** `Commitment` no
   tiene ningún flujo de creación accesible desde la UI. Quick Capture lo excluye deliberadamente
   por diseño (comentario propio: "it lives inside a Goal's workspace"). La sección "Commitments"
   de `GoalWorkspaceScreen.tsx` no tiene botón de agregar, a diferencia de sus secciones hermanas
   Hábitos y Tareas, que sí lo tienen. Existe una pantalla completa y correctamente construida —
   `apps/mobile/src/app/commitments/create.tsx`, título "Crear Compromiso" — pero **ningún
   componente de la aplicación enlaza a ella**. Registrado como `TECH_DEBT.md` Item 32.
7. **El detalle que motiva esta ADR:** esa pantalla huérfana ya usa **"Compromiso"** como su
   terminología, no "Tarea". No parece una implementación accidental — parece evidencia histórica
   de que la pregunta que esta ADR responde ya se había planteado, y posiblemente respondido, en
   algún punto anterior del desarrollo.

### Reconstrucción histórica (hipótesis, no hecho confirmado)

No hay forma de confirmar esto con certeza a partir del código actual, pero encaja de forma
consistente con todos los hallazgos documentados arriba:

1. Originalmente existía un flujo explícito y visible para crear un `Commitment`.
2. Durante la reestructuración de navegación de VS-031, ese flujo se simplificó o se quitó de la
   navegación principal.
3. La pantalla de creación quedó huérfana — construida, funcional, pero desconectada.
4. Para mantener una superficie accesible sobre los Commitments existentes, la pestaña bajo Goals
   se renombró a "Tareas" (ver el comentario de VS-031 en `GoalTasksTab.tsx`).
5. Más adelante nació `Task` como entidad y pantalla propias, protagonista de su propio flujo.
6. La palabra "Tareas" quedó sobrecargada — usada para dos conceptos de dominio distintos, sin que
   nadie lo decidiera activamente en ese momento.

Esta reconstrucción **no es parte de la decisión** — se incluye únicamente porque explica
coherentemente por qué la pantalla huérfana ya está alineada con la dirección que esta ADR
recomienda, y porque ayuda a entender que esto no es deuda técnica ordinaria: es una decisión de
producto que quedó pendiente, no un error de implementación.

---

## Decisión 1: ¿`Commitment` debe seguir siendo un concepto visible para el usuario?

**Opciones:**

- **Sí** — `Commitment` se expone como su propio concepto de primer nivel en la UI, con su propio
  flujo de creación, su propia terminología, y su propia superficie visual distinta de `Task`.
- **No** — `Commitment` queda como un detalle de implementación interno (por ejemplo, un
  agrupador/organizador de Tasks relacionadas), sin exponerse directamente al usuario como un
  concepto con el que interactúa de forma explícita.

**Evidencia a favor de "Sí" (recomendación de esta ADR):**

- El dominio ya modela a `Commitment` con una forma genuinamente distinta a `Task` — recurrencia,
  pausa/reanudación, ausencia de medición en minutos — no es una version — no es una versión
  simplificada de Task, es un concepto con su propio ciclo de vida.
- `Goal.ts` ya documenta la jerarquía completa (`Goal -> Commitment -> Task/Habit`) como una
  decisión arquitectónica ya tomada, no como algo a inventar.
- La aplicación se llama **Commitment**. Ocultar precisamente ese concepto detrás de la palabra
  "Tareas" es, como mínimo, una ironía evitable — y probablemente una oportunidad de producto
  desperdiciada, no solo un detalle de naming.
- Ya existe una implementación completa (`commitments/create.tsx`) construida específicamente para
  exponer este concepto — desecharla exigiría justificar por qué ese trabajo ya no aplica, no solo
  no continuarlo.
- La jerarquía Goal → Commitment → Task tiene más poder expresivo que Goal → Task directamente:
  cada nivel responde una pregunta distinta (¿qué quiero lograr? / ¿qué compromiso sostengo para
  lograrlo? / ¿qué hago hoy?) — colapsar Commitment eliminaría esa capacidad de respuesta.

**Evidencia a considerar para "No":** ningún hallazgo de esta investigación apunta en esta
dirección — se incluye la opción por completitud, no porque la evidencia la respalde.

---

## Decisión 2: si la respuesta a la Decisión 1 es "Sí", ¿cuál es el lenguaje oficial de cada concepto?

**Tabla propuesta (recomendación de esta ADR):**

| Dominio      | UI (es)    |
| ------------ | ---------- |
| `Goal`       | Objetivo   |
| `Commitment` | Compromiso |
| `Task`       | Tarea      |
| `Habit`      | Hábito     |

Una vez aprobada, esta tabla se vuelve **normativa**: ninguna pantalla, componente, o clave de
i18n puede usar "Tarea"/"Tareas" para referirse a un `Commitment`, y viceversa. "Compromiso" ya es
la terminología real de la pantalla huérfana (`commitments/create.tsx`, namespace i18n
`commitments`, `form.title` = "Crear Compromiso") — coincide exactamente con esta propuesta sin
necesidad de inventar copy nueva para ese caso específico.

---

## Alcance explícito: qué NO decide ni implementa esta ADR

- **No conecta la pantalla huérfana** (`commitments/create.tsx`) a ninguna navegación. Hacerlo
  antes de que esta ADR se apruebe formalmente equivaldría a tomar la Decisión 1 por la vía de los
  hechos, no por una decisión explícita — exactamente lo que esta ADR existe para evitar.
- **No renombra ninguna etiqueta, clave de i18n, ni ruta existente.** Ningún archivo de código
  cambia como resultado de escribir esta ADR.
- **No diseña el flujo de creación, edición, ni la superficie visual** que Commitment tendría si la
  Decisión 1 es "Sí" — eso es trabajo de diseño/implementación posterior, gateado por la
  aprobación de esta ADR, no parte de ella.
- **No extrae componentes compartidos** (`TaskCard`/`CommitmentCard`) — ver `TECH_DEBT.md` Item 31,
  que documenta por qué ese trabajo espera explícitamente a que esta ADR se resuelva primero.

---

## Consecuencias

- **Positivas:** desbloquea, con una referencia estable, todo el trabajo que estaba explícitamente
  detenido a la espera de esta decisión — el naming de "Tareas" en las 3 pantallas afectadas, la
  conexión de `commitments/create.tsx`, y el diseño de los componentes compartidos de tarjeta. Sin
  esta ADR, cualquiera de esos trabajos corría el riesgo de cristalizar una decisión que después
  hubiera que deshacer.
- **`TECH_DEBT.md` Items 31 y 32 cambian de naturaleza:** dejan de tratarse como deuda técnica
  ordinaria ("algo que quedó a medias por descuido") y pasan a ser trabajo de implementación
  directa de un modelo ya decidido — sin la ambigüedad de producto que los bloqueaba hasta ahora.
- **Riesgo aceptado:** ninguno nuevo respecto al análisis original. El riesgo que esta ADR mitigaba
  — que el lenguaje del producto siguiera divergiendo del modelo de dominio por inercia, como ya
  ocurrió una vez — queda resuelto al aprobarla.

### Restricciones normativas (qué implica esta aprobación en la práctica)

A partir de la aprobación de esta ADR:

- ✅ `Commitment` se convierte formalmente en un concepto de cara al usuario, no solo de dominio.
- ✅ **"Compromiso"** queda reservado exclusivamente para representar a `Commitment`.
- ✅ **"Tarea"** queda reservado exclusivamente para representar a `Task`. Ninguna superficie de UI
  puede volver a usar "Tarea"/"Tareas" para representar un `Commitment`, bajo ninguna circunstancia.
- ✅ Toda funcionalidad futura que toque estos conceptos — Quick Capture, Goal Workspace, Coach,
  Insights, Today — debe preservar este lenguaje ubicuo. Un PR que reintroduzca la ambigüedad
  (por ejemplo, una nueva pantalla que llame "Tareas" a una lista de Commitments) se considera una
  regresión respecto a esta ADR, no una decisión de diseño legítima independiente.
- ✅ Los datasets de demo deben seguir reflejando fielmente `Goal -> Commitment -> Task`, tal como
  quedaron tras la reescritura de RI-13 — cualquier semilla nueva debe respetar la escala y el
  lenguaje de cada nivel de la jerarquía.

---

## Próximos pasos (registrados aquí para continuidad; su ejecución NO es parte de esta ADR)

Esta ADR resuelve el "qué" y el "por qué". El "cómo" y el "cuándo" de la implementación son
trabajo posterior, deliberadamente fuera de su alcance (ver "Alcance explícito" arriba). Se
registra aquí el plan acordado para que no se pierda entre sesiones:

### Paso 0 — Inventario de impacto (antes de tocar cualquier texto)

Recorrer todas las superficies donde aparece el concepto para evitar descubrir referencias
olvidadas semanas después:

| Superficie                             | Hoy                                 | Después de la ADR                         |
| -------------------------------------- | ----------------------------------- | ----------------------------------------- |
| Goals Tab (`GoalTasksTab`)             | "Tareas" (muestra Commitment)       | "Compromisos"                             |
| Goal Workspace (`GoalWorkspaceScreen`) | "Tareas" (mezcla Commitment + Task) | "Compromisos" (sección propia)            |
| Quick Capture                          | sin opción Commitment               | pendiente — ver observación abierta abajo |
| Navegación / rutas                     | `commitments/create.tsx` huérfana   | pendiente                                 |
| Coach                                  | sin revisar                         | revisar                                   |
| Insights                               | sin revisar                         | revisar                                   |
| Today                                  | sin revisar                         | revisar                                   |

### Fases de implementación (no ejecutar todas en un único PR)

1. **Fase 1 — Lenguaje.** i18n, labels, navegación, tabs. Sin cambios funcionales — solo texto y
   el inventario del Paso 0 aplicado consistentemente.
2. **Fase 2 — Creación.** Conectar `commitments/create.tsx`; decidir el flujo desde Goal
   Workspace. La pregunta de si entra en Quick Capture se resuelve por separado (ver observación
   abierta).
3. **Fase 3 — Unificación visual.** Diseñar `CommitmentCard`/`TaskCard` y sus variantes
   compartidas — solo después de que el lenguaje de la Fase 1 esté estable.
4. **Fase 4 — Product Polish.** Aplicar los Cinco Pilares sobre las superficies ya renombradas y
   unificadas.

### Observación abierta — NO resuelta automáticamente por esta ADR

**¿Quick Capture debe poder crear Compromisos?** No se asume que sí. Quick Capture está diseñado
para capturas de baja fricción; un Compromiso es una entidad más estructural (posible Goal
asociado, recurrencia, estado inicial) que probablemente necesite más contexto del que ese flujo
ofrece. Esta pregunta requiere su propia evaluación de producto, independiente de esta ADR, antes
de decidir el diseño de la Fase 2.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
