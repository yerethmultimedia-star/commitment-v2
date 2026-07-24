# AR-005 — `UBIQUITOUS_LANGUAGE.md` declara "Active" pero omite Task/Habit, llama a Goal "candidato"

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (filtro programático, aplicado sobre las 31 AR no cerradas tras AR-018)

Parseadas las 55 filas de `REMEDIATION_ROADMAP_V1.md` (24 cerradas). Filtradas por dependencias
resueltas (AR-052 excluida explícitamente, pausada). Ordenadas por (Impacto desc, Esfuerzo asc, Riesgo
asc, Bloquea desc). **AR-005 es la única candidata de Impacto Medio con Esfuerzo Bajo** — el resto de
candidatas de Impacto Medio tienen Esfuerzo S/Medio o superior. Se verificó explícitamente que no era
AR-025 (expectativa previa del usuario, descartada por el propio filtro: AR-025 tiene Esfuerzo Medio,
un nivel por debajo en la prioridad). Owner=Claude, Decisión=N/A (ejecución directa) según el Roadmap —
a verificar, como en cada AR de este grupo, si la evidencia sostiene esa etiqueta.

### Nota de alcance, verificada antes de continuar (precedente de AR-003)

`AR-003/ANALISIS.md` registró explícitamente que `UBIQUITOUS_LANGUAGE.md` pertenece a un grupo de 7
documentos (los 4 fundacionales de `docs/01-product/` + `north_star.md`/`canonical_dictionary.md`/
`UBIQUITOUS_LANGUAGE.md`, listados en el Apéndice de `THE_COMMITMENT_FRAMEWORK.md`) que **AR-003
declaró explícitamente fuera de su propio alcance** — "documentos de visión de producto, no de
arquitectura de dominio... competencia del propio Framework, no de esta remediación arquitectónica."
**Esto no excluye a AR-005**: AR-003 se refería a la pregunta de _archivar/mover/eliminar_ ese grupo de
documentos como conjunto — una decisión de gobernanza documental de otro nivel. AR-005 no es esa
pregunta; es una corrección puntual de **exactitud de contenido** (¿el glosario describe correctamente
los agregados que existen hoy?), ya presente en el Roadmap desde el origen del programa como AR
independiente. Se registra aquí solo para no confundir ambos alcances, mismo criterio que AR-003 usó
para no confundir sus propios "7 documentos" con los del Framework.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-1-nucleo/01-ddd.md`, It.1): _"Ubiquitous Language
governance has drifted badly from the code it's supposed to describe... `UBIQUITOUS_LANGUAGE.md` (v1.1.0,
dated 2026-07-04, status 'Active') defines 11 terms and does not define `Task` or `Habit` at all — two
of the four core aggregates that exist in code today. It lists `Goal` as an 'Aggregate Candidate' (not
yet confirmed), when Goal is now a fully shipped, real `AggregateRoot`. It defines `Microaction` as a
core term — a concept that does not exist in the shipped domain (replaced by the richer `Task`)."_
Severidad: **Medium**. Recomendación explícita de la auditoría: _"needs a real rewrite (not archival)...
add Task and Habit, promote Goal out of 'Candidate,' remove or clearly mark Microaction as superseded."_

**Verificado hoy, con evidencia directa de código, no solo lectura del documento:**

1. **El documento no cambió desde la auditoría.** `UBIQUITOUS_LANGUAGE.md`: `Version: 1.1.0`, `Status:
Active`, `Last Updated: 2026-07-04` — idéntico. `Change History` no registra ninguna revisión
   posterior.
2. **`Task` y `Habit` siguen sin ningún término dedicado en el glosario** — confirmado leyendo el
   documento completo (11 términos: Identity, Commitment, Identity Anchor, Goal, Microaction, Pause,
   Rescue, Recovery, Victory of Return, Active Plan, BCP-47 Locale). Ninguno es `Task` ni `Habit`.
3. **`Goal` sigue descrito como `Aggregate Candidate`.** `grep -rn "extends AggregateRoot"
packages/domain/src` confirma que `Goal` (`goal/aggregate/goal.ts`) es un `AggregateRoot` real y
   confirmado hoy, igual que `Commitment`, `Identity`, `Task`, `Habit`.
4. **`Microaction` no existe en ningún lugar del código.** `grep -rln "Microaction\|Microacción"
packages/domain/src apps/backend/src apps/mobile/src` → cero coincidencias. Confirmado: reemplazado
   por completo por `Task`, exactamente como indicó la auditoría.
5. **La deriva creció desde la fecha del documento, no se mantuvo constante — hallazgo nuevo, no citado
   por la auditoría original.** `git log --follow --diff-filter=A` sobre los archivos de agregado
   confirma que 4 agregados reales adicionales se crearon **después** del `Last Updated: 2026-07-04` del
   glosario: `Device`/`Reminder` (2026-07-08), `Task` (2026-07-12), `Habit` (2026-07-14), `Credential`/
   `Session` (2026-07-23, AR-043). Ninguno de estos 6 agregados aparece en el glosario. Sumado a
   `Appearance` (agregado real, `appearance.model.ts`, tampoco documentado), **el glosario hoy omite 7
   de los 10 agregados reales del dominio** (`Identity`, `Commitment`, `Goal` son los únicos
   mencionados, y `Goal` con un estatus incorrecto) — más drift que el que motivó el hallazgo original.
6. **La máquina de estados documentada para `Commitment` ya no coincide con la real — segundo hallazgo
   nuevo, no citado por la auditoría.** El glosario describe 7 estados: `Draft, Active, Paused,
InFriction, Recovering, Completed, Archived`. `packages/domain/src/commitment/aggregate/commitment.ts`
   define `enum CommitmentState { Draft, Active, Paused, Completed, Cancelled }` — 5 estados reales,
   sin `InFriction`/`Recovering`/`Archived`, y con `Cancelled` no documentado. `grep -rln
"InFriction\|Recovering\|VictoryOfReturn\|RescueEvent"` sobre `packages/domain/src`/`apps/backend/src`
   → cero coincidencias: ninguno de esos conceptos de la FSM documentada existe en código. Los términos
   "Rescue"/"Recovery"/"Victory of Return" del glosario tampoco tienen ninguna representación en tipos,
   agregados o eventos del dominio actual.

### Respuesta a la pregunta de framing

> **El hallazgo original se confirma vigente y, en dos dimensiones que la auditoría no llegó a
> cuantificar, la deriva es más severa hoy que en el momento de la auditoría.** No es solo que Task/Habit
> sigan sin definirse y Goal siga como "Candidate" — hoy 7 de 10 agregados reales no aparecen en el
> glosario (no 2 de 4, como decía la auditoría, ya desactualizada en su propio conteo), y la FSM de
> `Commitment` documentada no corresponde a ningún estado real del código (3 de sus 7 estados no
> existen; 1 estado real, `Cancelled`, no está documentado). El diagnóstico de la auditoría — "Active,
> v1.1.0" implica vigencia falsa — se sostiene con más fuerza que antes.

**Consecuencia para el alcance de AR-005:** la auditoría original ya especificó el remedio general
(reescribir contra el código actual, no archivar). Pero la evidencia de hoy amplía considerablemente lo
que "reescribir" implica — no son 2 términos faltantes y 1 estatus por corregir, son 7 agregados y una
FSM completa. Eso deja una elección real, no solo mecánica: **¿la corrección debe limitarse
estrictamente a lo que la auditoría citó (Task, Habit, Goal, Microaction), o debe cubrir toda la
deriva verificada hoy (los 7 agregados no documentados y la FSM incorrecta)?** Ampliar el alcance sin
decidirlo explícitamente repetiría el patrón que este programa ya ha evitado en AR-022/AR-034/AR-055;
decidir arbitrariamente limitarlo a la cita original ignoraría evidencia ya verificada en esta misma
Fase 1. Se deja para Fase 2, mismo criterio de apertura que AR-004/AR-024 (documentales, pero con una
decisión real de alcance/estrategia detrás).

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**H1 (sincronización mínima) — la reescritura se limita exactamente a lo que citó la auditoría** (Task,
Habit, Goal, Microaction). Ventaja: intervención mínima, cierra exactamente el hallazgo original.
Desventaja reconocida por la propia hipótesis: el documento seguiría siendo objetivamente incorrecto el
mismo día del cierre — 5 de los 7 agregados no documentados (`Credential`, `Session`, `Reminder`,
`Device`, `Appearance`) y la FSM incorrecta de `Commitment` quedarían sin corregir pese a estar
verificados en la misma Fase 1.

**H2 (restaurar la correspondencia completa) — la reescritura cubre toda la deriva verificada hoy**, no
solo la citada originalmente: los 7 agregados ausentes, el estatus correcto de `Goal`, el retiro de
`Microaction`, y la FSM de `Commitment` alineada con `CommitmentState` real.

### Prueba adversarial de H1, no solo de H2

Antes de dar a H2 la victoria por defecto, se buscó explícitamente la mejor razón posible para preferir
H1 — el criterio de disciplina de alcance que este programa ha aplicado repetidamente (AR-022, AR-034,
AR-055: no expandir la remediación más allá de lo que el hallazgo originante exige).

**Esa disciplina no favorece a H1 aquí, por una razón concreta.** En AR-022/AR-034/AR-055, lo excluido
era deuda de una **dimensión distinta** a la que la AR remediaba (deuda de lint no relacionada,
migración de imports no relacionada, historial de tests no relacionado) — corregirla habría sido
resolver un problema ajeno "ya que estamos". Aquí no hay una dimensión distinta: los 7 agregados y la
FSM son la **misma** dimensión que el hallazgo original ya señaló (exactitud del glosario frente al
código), solo que verificada con más precisión en esta Fase 1 de lo que la auditoría pudo verificar en
la suya. Es exactamente el mismo patrón que AR-055 corrigiendo su propio conteo de 93 a 45/44 hallazgos
reales — no es ampliar el alcance, es sustituir una cifra desactualizada por la evidencia verificada
hoy dentro del mismo alcance.

**Riesgo adicional de H1 verificado explícitamente:** si D-005.1 se limitara a los términos citados, el
documento seguiría declarando `Status: Active` mientras omite 5 agregados reales y describe una FSM sin
respaldo en código — el mismo defecto de gobernanza que originó el hallazgo, solo que reducido en
magnitud, no eliminado. Cerrar la AR en ese estado no resolvería la pregunta de framing de Fase 1
("¿el diagnóstico de la auditoría se sostiene?") — la dejaría parcialmente vigente a propósito.

**Verificación de que H2, formulada como criterio general, no genera una obligación oculta sobre otros
documentos:** `grep -rln "Status: Active"` sobre `docs/02-domain/` y `docs/03-architecture/` confirma
que `UBIQUITOUS_LANGUAGE.md` es hoy el único documento con ese campo en estado `Active`
(`CONCEPTS.md`, el otro caso con ese campo, ya fue corregido a `Historical (Superseded)` por AR-003).
Adoptar el criterio de H2 como principio general no crea trabajo pendiente adicional hoy — su alcance
práctico inmediato es exactamente este documento.

**H1 no sobrevive la prueba adversarial — no por ser incorrecta en principio, sino porque el criterio de
disciplina de alcance que la respaldaría en otras AR no aplica a esta clase de hallazgo (deriva
documental de la misma dimensión, no una dimensión ajena). H2 queda confirmada.**

---

## Fase 2B — Decisión

**Estado: ✅ Cerrada. D-005.1 aprobada.**

**D-005.1:**

> **Los documentos declarados `Status: Active` deben reflejar el estado arquitectónico vigente en el
> momento de su remediación, no únicamente corregir las discrepancias enumeradas por auditorías
> anteriores. Cuando la evidencia verificable demuestre deriva adicional a la citada originalmente,
> esa deriva pertenece al mismo alcance de la remediación, no a un hallazgo separado.**

**2 propiedades congeladas:**

1. **La referencia de verdad es el código vigente, no la lista histórica de diferencias de una
   auditoría.** Toda afirmación del documento debe poder verificarse contra una clase de evidencia
   objetiva (una clase `AggregateRoot` existente, un `enum` real, un concepto ausente de todo el
   código).
2. **Ningún cambio de contenido sin respaldo verificable.** No se admite mejora editorial ni
   reformulación de términos ya correctos — únicamente correcciones donde la Fase 1 (o una
   verificación equivalente) ya demostró una discrepancia objetiva.

**Deja deliberadamente abierto (implementación):** el nivel de detalle con el que cada agregado nuevo se
documenta (una entrada mínima vs. una entrada completa con sinónimos prohibidos y Value Objects
asociados), el tratamiento exacto de `Microaction` (eliminar la entrada vs. marcarla explícitamente
como superseded), y si corresponde actualizar `Version`/`Last Updated`/`Change History` del propio
documento.

**Fase 4A:** se omite explícitamente. No hay un mecanismo técnico que comparar — la "implementación" es
la redacción del propio documento contra la evidencia ya verificada en Fase 1, no una elección entre
alternativas de arquitectura o herramienta. Mismo criterio que AR-018/AR-022.

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada.**

**Cambio realizado:** reescrito íntegramente `docs/02-domain/UBIQUITOUS_LANGUAGE.md` (único archivo
tocado), contra la evidencia ya verificada en Fase 1: se añadieron entradas para los 7 agregados
ausentes (`Task`, `Habit`, `Credential`, `Session`, `Reminder`, `Device`, `Appearance`), se promovió
`Goal` de "Aggregate Candidate" a Aggregate Root confirmado, se corrigió la FSM de `Commitment`
(`Draft/Active/Paused/Completed/Cancelled`, eliminando `InFriction`/`Recovering`/`Archived`), y se
movió `Microaction` a una nueva sección explícita de "Superseded Terms" en vez de eliminarla en
silencio (mismo principio no-destructivo que AR-001/AR-003 aplicaron a otros documentos).

**Hallazgo adicional durante la implementación, cubierto por el mismo criterio de D-005.1, no una
ampliación de alcance:** al redactar cada entrada contra su evidencia de código, se verificaron también
los 2 términos restantes del glosario original que Fase 1 no había revisado explícitamente
(`Identity Anchor`, `Active Plan`). `grep -rln` sobre `IdentityAnchor`/`Ancla` y `ActivePlan` en todo
`packages/domain/src`/`apps/backend/src`/`apps/mobile/src` → **cero coincidencias en ambos casos** —
ningún Value Object ni concepto de código respalda ninguno de los dos términos. D-005.1 ya cubre
explícitamente este caso ("cuando la evidencia verificable demuestre deriva adicional a la citada
originalmente, esa deriva pertenece al mismo alcance") — se trataron con el mismo criterio que
`Microaction`: movidos a "Superseded Terms", no eliminados en silencio. `Pause` sí se verificó
respaldada (`CommitmentState.Paused` real) y permanece sin cambios.

**Validaciones ejecutadas, con evidencia real:**

1. **Los 10 agregados reales del dominio aparecen todos, exactamente una vez cada uno, con la etiqueta
   correcta.** Verificado cruzando `grep -rln "extends AggregateRoot" packages/domain/src
apps/backend/src` (10 archivos, excluyendo tests) contra las 10 entradas "Aggregate Root" del
   documento reescrito — coincidencia 1 a 1.
2. **Cero ocurrencias de "Aggregate Candidate" en el documento final** — `Goal` queda como Aggregate
   Root confirmado, sin calificador de candidatura.
3. **La sección de estados de `Commitment` coincide exactamente con `CommitmentState`** — 5 estados
   documentados, 5 estados reales, sin diferencia en ningún sentido (ni de más, ni de menos).
4. **Los 6 términos sin respaldo de código quedan marcados explícitamente, no eliminados** —
   `Microaction`, `Identity Anchor`, `Rescue`, `Recovery`, `Victory of Return`, `Active Plan`, en una
   sección separada que cita la ausencia de código verificada, preservando trazabilidad histórica.
5. **`git diff` limitado exclusivamente a `docs/02-domain/UBIQUITOUS_LANGUAGE.md`** — ningún archivo de
   código tocado (esta AR es puramente documental; ninguna corrección implicaba cambiar
   comportamiento).
6. **Ningún cambio editorial sin respaldo** — los términos ya correctos (`Identity`, `Commitment` como
   concepto, `Pause`, `BCP-47 Locale`) permanecen con su definición original, sin reformulación.

---

## Fase 5 — Cierre

**Estado: ✅ Cerrada.**

D-005.1 materializada por completo: el documento vuelve a ser una representación fiel del lenguaje
ubicuo vigente, no solo del subconjunto que la auditoría original pudo citar. La pregunta de framing de
Fase 1 ("¿el diagnóstico de la auditoría se sostiene?") queda resuelta afirmativamente y sin dejar
deriva conocida sin corregir.

**Primer caso del programa donde una decisión de Fase 2 (D-005.1) se formuló como un criterio general
("los documentos `Active` deben reflejar el estado vigente") en vez de una lista de correcciones
puntuales — y ese criterio general demostró su utilidad dentro de la misma Fase 4B**, al cubrir 2
términos adicionales (`Identity Anchor`, `Active Plan`) que ni siquiera Fase 1 había revisado
explícitamente, sin necesitar una nueva decisión ni reabrir D-005.1.

---

## Estado

**Fase 1, Fase 2A, Fase 2B, Fase 4B y Fase 5 cerradas (Fase 4A omitida explícitamente, mecanismo único
sin alternativas). AR-005 CERRADA.** D-005.1 aprobada e implementada: `UBIQUITOUS_LANGUAGE.md`
reescrito contra la evidencia verificada — 10/10 agregados reales documentados correctamente, FSM de
`Commitment` exacta, 6 términos sin respaldo de código marcados como superseded sin eliminación
silenciosa. `git diff` limitado a un único archivo de documentación. Programa alcanza **25/55 AR
cerradas** — hito de la primera revisión transversal.
