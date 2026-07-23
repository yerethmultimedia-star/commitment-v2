# AR-028 — Concurrencia Optimista en Repositorios Reales

Registro completo del ciclo de vida de AR-028, siguiendo el mismo estándar validado en AR-001
(`docs/ARCHITECTURE_REMEDIATION/AR-001/ANALISIS.md`): `Análisis → Opciones → Trade-offs → Decisión →
Implementación → Validación → Dashboard`, con la regla permanente del programa aplicada desde el
inicio: **toda AR debe intentar demostrar que el problema formulado originalmente no es el problema
real.**

---

## Fase 1 — Análisis

**Estado: ✅ Cerrada (2026-07-20).**

### Pregunta original (framing de la auditoría)

> "No existe concurrencia optimista en los repositorios reales."

### Evidencia recogida (código, no inferencia)

**1. Ausencia de compare-and-swap en la fuente de verdad — confirmado.** Las 4 implementaciones
reales de repositorio (`InMemoryGoalRepository`, `InMemoryCommitmentRepository`,
`InMemoryTaskRepository`, `InMemoryHabitRepository`) comparten el patrón idéntico: `save()` no
recibe `expectedVersion`, no compara contra la versión almacenada, sobrescribe incondicionalmente
(`this.store.set(key, aggregate)`), y solo actualiza un contador de versión derivado del propio
objeto recibido. Ningún Command/DTO (verificado en `EditCommitmentCommand`) lleva un campo de
versión; no existe `If-Match`/`ETag` en ningún controller. El cliente no tiene forma de decir "esta
era la versión que yo leí."

**2. Inventario completo de repositorios:**

| Aggregate  | Persistencia                    | Contador de versión          | Compare-and-swap | Control de conflicto                                |
| ---------- | ------------------------------- | ---------------------------- | ---------------- | --------------------------------------------------- |
| Goal       | Memoria (Map)                   | Sí                           | No               | No (el event store lo tiene, pero es un log aparte) |
| Commitment | Memoria (Map)                   | Sí                           | No               | No                                                  |
| Task       | Memoria (Map)                   | Sí                           | No               | No                                                  |
| Habit      | Memoria (Map)                   | Sí                           | No               | No                                                  |
| Reminder   | Memoria (Map)                   | **No, ni siquiera contador** | No               | No                                                  |
| Device     | Memoria (Map)                   | No                           | No               | No                                                  |
| Identity   | No tiene repositorio de backend | —                            | —                | —                                                   |

**3. Escenarios reales, no hipotéticos:**

- `CancelTasksOnCommitmentCompletedSaga` (`task/application/sagas/cancel-tasks-on-commitment-completed.saga.ts`) cancela en cascada, vía `CommandBus` asíncrono, todos los Tasks de un Commitment completado — puede competir con una edición manual del mismo Task en el mismo instante.
- `ReminderWorkerService.process()` hace `findById()` → `markProcessing()` → `save()` → ... → `complete()` → `save()` — mismo patrón read-modify-write, expuesto a reintentos de BullMQ (at-least-once por defecto; no se encontró configuración que lo desactive).

**4. Documentos que gobiernan el comportamiento:**

- **Rule #87** (`engineering/system-prompt.md:333`) — define cuándo cambia la versión ("solo con
  cambios de negocio significativos"), y declara explícitamente ser _"fundamental para Offline
  First synchronization y Optimistic Concurrency"_ — sin implementar ninguna de las dos.
- **ADR-021** — describe el patrón `Map + versión` explícitamente como _"para concurrencia
  optimista"_. El código no lo hace cumplir.
- El puerto `VersionedCommitmentRepository` reconoce en su propio comentario que solo _"prepara la
  interfaz para futura Optimistic Concurrency (Rule #87)"_ — no la implementa.

**5. Hallazgo más significativo de esta fase — no es una ausencia, es una inversión.** `EventStore`
(`packages/domain/src/core/event-store.interface.ts`) define y `InMemoryEventStore` implementa
compare-and-swap real y correcto: `saveEvents(streamId, expectedVersion, events)` lanza
`ConflictException` si `currentVersion !== expectedVersion`. Pero, verificado en
`link-commitment-to-goal.handler.ts`: el estado autoritativo se guarda primero, sin protección
(`goalRepository.save(goal)`), y **solo después** se llama `eventStore.saveEvents(goal.id.value,
version - events.length, events)` — un `expectedVersion` derivado del guardado que ya ocurrió. El
OCC existe y funciona; protege un log derivado (Goal, no-autoritativo), no la fuente de verdad. Esto
elimina una hipótesis: no es que el equipo no supiera implementar OCC — lo implementó
correctamente, en el lugar equivocado.

### Reformulación del framing (registrada, no rechazada)

El framing original se sostiene parcialmente: **"los repositorios que representan la fuente de
verdad no implementan concurrencia optimista"** es cierto y queda demostrado, sin interpretación
alternativa razonable. Pero es incompleto. Framing oficial adoptado:

> **La infraestructura de versionado ya existe; el defecto arquitectónico es que hoy no protege la
> fuente de verdad que gobierna las escrituras concurrentes.**

### Hipótesis de trabajo

**H-028.1 — Inversión de responsabilidades.** El problema no es ausencia de OCC, es que el OCC que
sí existe protege el artefacto equivocado:

```text
Hoy:                                  Se esperaría:
Estado autoritativo                   Estado autoritativo
   ↓ save() — sin OCC                    ↓ OCC
Log de eventos                        Eventos derivados
   ↓ saveEvents() — con OCC
```

No se afirma todavía que esta sea la solución — solo que el patrón merece atención central en Fase 2.

### Hallazgo registrado — Inconsistencia Documento ↔ Implementación (no governance failure, todavía)

ADR-021 atribuye al patrón `Map + versión` una propiedad operacional (concurrencia optimista) que
la implementación no posee. **Clasificación deliberadamente distinta a la de AR-001:** no se declara
que "ADR-021 está equivocada" ni se reclasifica su autoridad — no se ha revisado su contexto
completo (¿pretendía describir un estado futuro o el estado ya vigente al momento de escribirse?).
Se registra como **Inconsistencia Documento ↔ Implementación**, pendiente de investigar en Fase 2
si merece una corrección formal o si ya describía una intención futura correctamente entendida por
su propio autor.

### Corrección al grafo de dependencias

**AR-048 (Offline First) ya no depende completamente de AR-028.** Offline First tiene al menos dos
capacidades distinguibles: almacenamiento local + cola de mutaciones (no depende de OCC del
servidor) y reconciliación (sí depende). Solo la segunda —que se solapa con AR-049— requiere que
AR-028 esté resuelta. AR-048 puede iniciarse en paralelo. Corregido en
`REMEDIATION_ROADMAP_V1.md`.

### Decisión de cierre de Fase 1

- ✅ Framing aceptado, con la reformulación de arriba.
- ✅ Grafo corregido (AR-048 ya no bloqueada por completo).
- ✅ Inconsistencia ADR-021 registrada como Documento↔Implementación, no como fallo de gobernanza.
- ✅ Escenarios (Saga, BullMQ) aceptados como evidencia válida, no hipotética.

---

## Fase 2A — Modelo Arquitectónico

**Estado: ✅ Cerrada (2026-07-20).** Responde las 3 preguntas de diseño sin tocar APIs, interfaces,
ni implementación — solo el modelo conceptual. Todas quedaron resueltas por evidencia, no por
propuesta nueva.

### Evidencia adicional recogida antes de responder

`packages/domain/src/shared/aggregate-root.ts` (la base real que usan las 4 aggregates) **ya lleva
un `_version` interno**, incrementado en cada `recordEvent()` y expuesto vía `.version` — un hecho
de dominio legítimo, no algo que haya que inventar. Sin embargo, las 4 implementaciones de
repositorio **no lo leen**: mantienen su propio contador redundante en un `Map<string, number>`
aparte, derivado de `getUncommittedEvents().length`. Hoy ambos números coinciden solo porque el
`Map` en memoria guarda la misma referencia de objeto — no hay serialización de por medio. No existe
ningún método `fromSnapshot`/`reconstitute`; la única vía de rehidratación es `loadFromHistory(events)`,
replay puro de eventos, que nadie usa bajo el modelo de estado versionado real.

### Respuestas

**Pregunta 3 — ¿Qué papel desempeña el Event Store? Cerrada, sin ambigüedad.** ADR-021 no solo
describe su uso actual como bitácora — rechaza explícitamente migrar a Event Sourcing como decisión
presente (_"la carga de la prueba no está satisfecha todavía"_). Establecido:

> El Event Store es un mecanismo de auditoría y registro de eventos de dominio. No constituye la
> fuente de verdad ni existe una decisión arquitectónica vigente para convertirlo en ella.

**Pregunta 1 — ¿Cuál es la fuente de verdad? Cerrada, ya decidida por ADR-021.** _"El estado
versionado del agregado sigue siendo, sin excepción, la fuente de verdad."_ No era, en realidad, una
pregunta abierta para AR-028 — era una verificación de que la arquitectura ya la había resuelto.
Resultado válido de todas formas: no toda pregunta de diseño debe terminar en una decisión nueva;
algunas confirman que ya existe una y que corresponde respetarla.

> Estado persistido = fuente de verdad.

**Pregunta 2 — ¿Dónde pertenece la responsabilidad de OCC? Cerrada, con reparto en tres partes, no dos.**

| Responsabilidad                                          | Dueño       |
| -------------------------------------------------------- | ----------- |
| Semántica de la versión (qué significa, cuándo cambia)   | Agregado    |
| Persistencia de la versión entre cargas/reconstrucciones | Repositorio |
| Verificación de concurrencia (comparar y rechazar)       | Repositorio |

No es "mover todo al Event Store" (eso contradiría la Pregunta 1, ya cerrada) — es que el
Repositorio debería leer el `.version` que el Agregado ya expone en vez de recalcularlo, y debería
rechazar el `save()` si la versión esperada no coincide con la almacenada, tal como
`EventStore.saveEvents()` ya hace correctamente, solo que aplicado al artefacto equivocado.

### El hallazgo más importante de esta fase

No es la ausencia de OCC. Es esto:

> **Existen dos representaciones independientes del mismo concepto de versión** (el `_version` del
> Agregado, y el `Map` del Repositorio), que hoy coinciden únicamente por una propiedad accidental:
> el `Map` en memoria conserva la misma referencia de objeto. El sistema depende hoy de la identidad
> del objeto en memoria para mantener consistente el versionado — eso desaparece en cuanto exista
> serialización real (Postgres, Redis, caché, un proceso separado, una llamada de API).

### Hallazgo secundario — fuera de alcance de AR-028, registrado para el futuro

**Gap de rehidratación:** no existe `fromSnapshot`/`reconstitute` para reconstruir un agregado con su
versión correcta desde datos serializados. No se mezcla con AR-028 — OCC puede implementarse sin
snapshots. Se evaluará si merece una AR propia o si encaja en la futura remediación de persistencia
real (candidatos: AR-043 o AR-048, según su alcance final).

### Hipótesis principal para Fase 2B (a intentar refutar, no aceptada todavía)

**H-028.2 — sustituye a H-028.1 como hipótesis líder.**

> El verdadero defecto arquitectónico es la duplicación de responsabilidades sobre el versionado. La
> ausencia de compare-and-swap en los repositorios es una **consecuencia** de esa duplicación, no el
> problema fundamental.

Mismo patrón que AR-001: el problema formulado originalmente ("falta OCC") no sobrevivió intacto —
cambió a algo un nivel más profundo (duplicación de responsabilidades). Si H-028.2 sobrevive la
comparación de alternativas en Fase 2B, se convierte en el framing final de AR-028.

---

## Fase 2B — Alternativas

**Estado: ✅ Cerrada (2026-07-20).** Comparadas 4 opciones más una quinta descartada en el propio
análisis, contra los criterios de AR-001 (complejidad, consistencia, escalabilidad, coste de
migración, mantenibilidad, impacto sobre el roadmap, compatibilidad con ADRs existentes).

### Reformulación de H-028.2 (refutación parcial, aceptada)

La hipótesis de cierre de Fase 2A decía que la duplicación de responsabilidades era "el defecto
real". Se sometió a prueba: ¿eliminar el `Map` redundante y leer `aggregate.version` basta para
resolver el conflicto de escritura concurrente? **No** — se puede colapsar la duplicación y seguir
sin comparar/rechazar en el `save()`. La duplicación, por sí sola, no explica por qué falta el
compare-and-swap; es un factor de riesgo, no la causa completa. **H-028.2 corregida:**

> La duplicación del versionado aumenta el riesgo de inconsistencias y dificulta implementar OCC
> correctamente; la ausencia de compare-and-swap sigue siendo el mecanismo inmediato que permite las
> escrituras perdidas.

### Comparación de opciones

**Opción A — Estado como fuente de verdad + OCC en los repositorios.** El repositorio deja de
mantener su `Map` de versión redundante, lee `aggregate.version`, y rechaza `save()` si no coincide
con la versión almacenada.

- Complejidad: Baja — 4 archivos, sin infraestructura nueva.
- Consistencia: Alta — reutiliza el patrón ya correcto de `EventStore.saveEvents()`, aplicado al
  artefacto correcto.
- Escalabilidad: Positiva — es la forma exacta que tomaría `WHERE version = expectedVersion` en
  Postgres el día que exista. **Prueba de proyección a futuro, superada:** la decisión no introduce
  deuda de transición — la reduce, porque el diseño ya anticipa la forma que tomará la persistencia
  real.
- Coste de migración: Muy bajo.
- Mantenibilidad: Alta — una sola fuente de verdad para la versión, no dos sincronizadas por
  accidente.
- Impacto en roadmap: Desbloquea Wave 6 sin rediseño previo.
- Compatibilidad con ADRs: Total — es lo que ADR-021 ya afirma que debería existir.
- **✅ Sobrevive.**

**Opción B — Event Store como fuente de verdad (Event Sourcing real).** Contradice directamente la
Pregunta 1 (cerrada en Fase 2A) y el rechazo explícito de ADR-021 a esta migración. **❌ Rechazada** —
no por descarte apresurado, sino porque no aparece evidencia nueva en Fase 2A/2B que justifique
reabrir una decisión ya tomada y documentada.

**Opción C — renombrada: Generalización de la Infraestructura de Auditoría** (no "modelo híbrido").
Al definirla con precisión, no es una alternativa a OCC — es extender la bitácora de auditoría (hoy
solo Goal la tiene funcionando; Task registrada pero nunca invocada; Commitment/Habit sin ella) a
los 4 aggregates, coherente con lo que ADR-021 ya preveía como "infraestructura común de historial".
**❌ Replanteada, no rechazada** — es trabajo ortogonal de auditoría/historial, no de concurrencia;
candidata a su propia AR o a una extensión futura de ADR-021, fuera del núcleo de AR-028.

**Opción D — Bloqueo pesimista (lock por agregado).** Evitaría el conflicto hoy, pero un lock en
memoria de un solo proceso no sobrevive a una segunda instancia del backend — contradice la
proyección a escalado horizontal ya identificada como bloqueada por el estado en memoria
(Architecture Review, Iteración 16). **❌ Rechazada** — sería trabajo desechable en el momento de
escalar.

**Opción E (nueva, propuesta y descartada en la propia Fase 2B) — que el Agregado haga la
comparación.** El Agregado nunca conoce el estado ya persistido — solo sabe "yo tengo versión 12",
no si la base ya avanzó a 13. Esa comparación requiere conocimiento del estado almacenado, que solo
el Repositorio tiene. **❌ Descartada** — la responsabilidad no pertenece al dominio, pertenece a la
infraestructura de persistencia. Consistente con el reparto de 3 responsabilidades ya cerrado en
Fase 2A.

### Nota sobre la evidencia de DI (no decisiva, pero relevante para el coste)

La inyección por tokens string con un único `useClass` por puerto (confirmado en los 4 módulos)
explica por qué el coste de migración de Opción A es tan bajo: el puerto nunca fue ejercitado con un
segundo adaptador (hallazgo ya conocido de la Architecture Review, Iteración 2), así que modificar el
único adaptador existente no tiene que preservar compatibilidad con ningún otro consumidor real.

### Veredicto

| Opción | Resultado      | Motivo                                                                                                       |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------------ |
| A      | ✅ Sobrevive   | Consistente con la arquitectura, bajo coste, evoluciona naturalmente hacia persistencia real.                |
| B      | ❌ Rechazada   | Contradice una ADR vigente; sin evidencia nueva que justifique reabrirla.                                    |
| C      | ❌ Replanteada | No es alternativa a OCC — es extensión de auditoría, alcance distinto, ortogonal.                            |
| D      | ❌ Rechazada   | Resuelve el problema solo dentro de un proceso; conflictúa con la evolución prevista a múltiples instancias. |
| E      | ❌ Descartada  | La comparación de versión no pertenece al dominio — el Agregado no conoce el estado persistido.              |

### Framing final de AR-028

> La solución no consiste en introducir un nuevo modelo de concurrencia, sino en aplicar el
> mecanismo de compare-and-swap al modelo de versionado que la arquitectura ya definió y que el
> dominio ya expresa correctamente.

Fase 2B cerrada — Opción A sobrevivió los intentos razonables de refutación, no se elige por ser "la
preferida" sino por ser la única consistente con las ADRs vigentes, el modelo de dominio, la
estrategia de persistencia futura, el roadmap corregido, y la evidencia de Fases 1 y 2A.

---

## Fase 3 — Decisión

**Estado: 🟦 En progreso.**

### Alcance decidido

1. **Los 4 repositorios reales** (`InMemoryGoalRepository`, `InMemoryCommitmentRepository`,
   `InMemoryTaskRepository`, `InMemoryHabitRepository`) dejan de mantener un `Map<string, number>`
   de versión redundante. Leen `aggregate.version` (ya expuesto por `AggregateRoot`) como única
   fuente de la versión actual en memoria.
2. **`save()` incorpora compare-and-swap:** recibe (o infiere) la versión que el llamador cree
   vigente y rechaza la escritura si no coincide con la versión realmente almacenada, lanzando un
   error de conflicto — mismo mecanismo semántico que `EventStore.saveEvents()` ya implementa
   correctamente, ahora aplicado a la fuente de verdad real.
3. **No se toca el Event Store, ni su rol de auditoría, ni ADR-021's decisión de "no Event
   Sourcing".** Permanece exactamente como está.
4. **La Opción C (generalizar auditoría a los 4 aggregates) queda explícitamente fuera de esta AR**
   — se registra como trabajo futuro relacionado, no como parte de la decisión de AR-028.
5. **El gap de rehidratación (`fromSnapshot`/`reconstitute`) permanece fuera de alcance**, tal como
   se registró en Fase 2A — no es necesario para implementar OCC sobre el modelo actual (in-memory,
   sin serialización todavía).
6. **Mini-análisis previo, resuelto:** ¿ADR-021 es normativa o descriptiva sobre "concurrencia
   optimista"? La frase exacta (§Decisión, punto 1) — _"siguiendo el mismo patrón CQRS + estado
   versionado **ya probado** por Commitment/Task/Habit — mismo tipo de repositorio en memoria (Map +
   versión para concurrencia optimista)"_ — está en pasado, afirmando como hecho ya establecido que
   Commitment/Task/Habit ya tenían concurrencia optimista funcionando, usado como precedente para
   replicar el patrón en Goal. **Caso B: descriptiva, e incorrecta sobre el estado que describe** —
   Fase 1 demostró que ninguno de los tres módulos implementaba compare-and-swap al momento de
   escribirse esta ADR. Tratamiento proporcional (no al estilo AR-001, porque el núcleo de la
   decisión — estado como fuente de verdad, Event Store como auditoría — sigue siendo correcto y no
   se toca): corrección factual puntual a esa frase específica en ADR-021, más una referencia hacia
   adelante señalando que AR-028 completa lo que se asumió prematuramente como logrado. No se
   reclasifica la autoridad de la ADR — se corrige una caracterización puntual dentro de ella.

### Qué NO decide esta AR (explícito, para evitar scope creep)

- No decide la estrategia de persistencia real (Postgres/etc.) — eso sigue abierto en el roadmap
  general, independiente de esta AR.
- No decide si/cuándo se generaliza la auditoría a los 4 aggregates (Opción C).
- No decide el mecanismo de reconciliación de Sync (AR-049) — solo remueve el bloqueo que impedía
  empezarlo con una base sólida.
- No introduce ningún cambio a `Reminder`/`Device` — quedan fuera del alcance porque ninguno de los
  dos es hoy una fuente de verdad con conflicto de escritura demostrado en el mismo sentido que los 4
  aggregates principales (`Reminder` ni siquiera tiene contador de versión — se registra como
  hallazgo separado, no se resuelve aquí).

### Criterio de validación (obligatorio antes de considerar AR-028 cerrada)

> Después de implementar AR-028 deberá ser posible provocar un conflicto de escritura concurrente y
> verificar que el segundo `save()` falla explícitamente en lugar de sobrescribir silenciosamente el
> estado.

Se ejecutará como test automatizado en Fase 6 (Validación) para cada uno de los 4 repositorios: cargar
el mismo agregado dos veces (dos "sesiones" concurrentes), mutar y guardar la primera copia
(éxito), luego mutar y guardar la segunda copia con la versión ya obsoleta (debe fallar con un error
de conflicto explícito, no un guardado silencioso). Sin este test pasando para las 4 aggregates,
AR-028 no se marca ✅ Cerrada — el código puede compilar y aun así no cumplir el objetivo real de la
remediación.

### Fase 3 — Decisión aprobada (2026-07-20)

Los 6 puntos del alcance quedan aprobados, con el punto 6 resuelto vía el mini-análisis de arriba
(Caso B, corrección factual puntual ya aplicada a ADR-021). Entra a Fase 4 — Implementación.

---

## Fase 4A — Diseño Técnico

**Estado: ✅ Cerrada (2026-07-20).** Revisión previa a tocar código, exigida por el usuario porque
AR-028 modifica un contrato arquitectónico (el puerto `save()`), no solo una implementación interna.

### Evidencia recogida antes de decidir

- **Los 47 call sites reales** de `.save()` sobre los 4 repositorios fueron enumerados y varios
  leídos en detalle (`register-commitment`, `register-goal`, `register-habit`, `complete-task`).
  La mayoría captura el valor de retorno (`const version = await repo.save(x)`) y lo pasa a un
  `*Result` DTO devuelto en la respuesta HTTP; algunos lo descartan. **El tipo de retorno debe
  seguir siendo `Promise<number>`** para no romper ninguno de los 47 sitios.
- **Hallazgo que resuelve la Pregunta 1 (firma de `save()`) de forma más precisa de lo anticipado:**
  `recordEvent()` incrementa `_version` **antes** de aplicar cada evento — así que
  `aggregate.version`, tras mutar una instancia, ya es la versión _nueva_, no la de carga. Pero el
  propio `link-commitment-to-goal.handler.ts` ya resuelve esa aritmética para el Event Store:
  `version - events.length` = la versión con la que el agregado fue cargado. Esa fórmula no depende
  de ningún parámetro nuevo — el agregado ya expone todo lo necesario
  (`.version` y `.getUncommittedEvents().length`). **Confirmado: Opción A (`save(aggregate)`, sin
  parámetro `expectedVersion`) es suficiente** — Opción B habría exigido tocar los 47 call sites
  (capturar la versión justo tras `findById()`), contradiciendo el bajo coste de migración que ya
  hizo sobrevivir a Opción A en Fase 2B.
- **Tipo de error:** dos convenciones ya coexisten en el código — `XStateConflictError extends Error`
  (10+ archivos, capa de aplicación, agnóstico de framework, mapeado por cada controller a
  `ConflictException`) vs. `InMemoryEventStore` lanzando `ConflictException` de `@nestjs/common`
  directamente desde infraestructura. Se sigue el primer patrón (el dominante) para no extender la
  inconsistencia existente — `OptimisticConcurrencyError extends Error`, mapeado centralizadamente.
- **Hallazgo importante, no anticipado:** el objeto retornado por `findById()` es la **misma
  referencia** que vive en el `Map` interno — no una copia. Esto significa que leer "versión
  almacenada" directamente del objeto agregado habría sido inútil (cualquier mutación en curso de
  otro handler ya se reflejaría ahí). Por eso el `Map<string, number>` de versión se mantiene como
  bookkeeping _independiente_ del grafo de objetos — su única operación de escritura pasa a ser una
  copia directa de `aggregate.version`, nunca una suma.
- **Invariante confirmada, no heurística (observación del usuario):** `versión actual = versión de
carga + eventos pendientes` es una relación que el propio `AggregateRoot` ya expresa mediante
  `_version`/`getUncommittedEvents()` — AR-028 la hace explícita, no la inventa.

### Decisiones de diseño

1. `save(aggregate): Promise<number>` — sin cambio de firma en los 4 puertos.
2. `aggregate.version` = versión tras aplicar todas las mutaciones no confirmadas de la instancia.
3. `OptimisticConcurrencyError extends Error`, agnóstico de framework, mapeado en un único punto
   centralizado — no duplicado por controller (a diferencia de `*StateConflictError`, porque este
   es un concern de infraestructura idéntico en los 4 aggregates, no semántica de dominio distinta
   por aggregate).
4. El repositorio nunca incrementa la versión — solo lee, compara, persiste.
5. Compare-and-swap traducible mecánicamente a `UPDATE ... WHERE id = ? AND version = ?` en
   Postgres futuro.
6. Compatibilidad hacia atrás verificada (no asumida) contra los 47 call sites reales.

**Recomendación del usuario, adoptada:** la resta `aggregate.version - uncommittedEvents.length` se
extrae a una única función compartida (`getLoadedVersion`), no se copia 4 veces — si la forma de
calcular la versión cambia en el futuro (snapshots, eventos sintéticos), solo un lugar cambia.

**Criterio de validación adicional del usuario, adoptado:** además de "el segundo `save()` debe
fallar," se añade "tras un `save()` exitoso, el repositorio debe persistir exactamente
`aggregate.version`, sin recalcularla ni modificarla" — verificado explícitamente en los tests de
Fase 4B.

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada (2026-07-20).**

### Archivos nuevos

- `apps/backend/src/infrastructure/versioning/loaded-version.ts` — `getLoadedVersion(aggregate)`,
  la única función que conoce la aritmética de versión de carga.
- `apps/backend/src/infrastructure/errors/optimistic-concurrency.error.ts` — `OptimisticConcurrencyError`.
- 3 archivos de test nuevos: `goal/infrastructure/__tests__/in-memory-goal.repository.spec.ts`,
  `task/infrastructure/__tests__/in-memory-task.repository.spec.ts`,
  `habit/infrastructure/__tests__/in-memory-habit.repository.spec.ts` (Goal/Task/Habit no tenían
  spec de repositorio previo; Commitment sí, se extendió en vez de duplicar).

### Archivos modificados

- Los 4 repositorios (`InMemoryCommitmentRepository`, `InMemoryGoalRepository`,
  `InMemoryTaskRepository`, `InMemoryHabitRepository`): eliminado el cálculo `current + N`; `save()`
  ahora deriva `loadedVersion` vía `getLoadedVersion()`, compara contra la versión almacenada, lanza
  `OptimisticConcurrencyError` en mismatch, y persiste `aggregate.version` tal cual.
- Los 4 puertos (`Versioned*Repository`): comentario actualizado — ya no "prepara la interfaz para
  futura OCC", ahora la implementa. Sin cambio de firma.
- `filters/problem-details-exception.filter.ts`: una rama nueva mapeando `OptimisticConcurrencyError`
  → HTTP 409, centralizada (no duplicada por controller).
- `docs/03-architecture/adr_021_goal_backend_and_domain_history_infrastructure.md`: corrección
  puntual ya aplicada en Fase 3.
- `commitment/infrastructure/__tests__/in-memory-commitment.repository.spec.ts`: extendido con la
  suite `AR-028 — optimistic concurrency` (2 tests).

### Bug real encontrado y corregido durante la implementación (no en el diseño)

Los 4 `save()` no estaban declarados `async`. Un `throw` dentro de una función no-`async` que
declara devolver `Promise<T>` lanza **de forma síncrona**, no como rechazo de promesa — el primer
test de conflicto lo confirmó al fallar con un error no capturado por `.rejects.toThrow()`. Corregido
declarando los 4 métodos `async` (comportamiento correcto y más idiomático que el
`Promise.resolve()`/`Promise.reject()` manual previo).

**Hallazgo relacionado, fuera de alcance de AR-028 — no corregido:** `InMemoryEventStore.saveEvents()`
tiene el mismo defecto exacto (`throw` dentro de una función no-`async`). No se toca aquí porque
`EventStore` está fuera del alcance decidido en Fase 3 (punto 3: "no se toca el Event Store"). Se
registra como hallazgo para una futura AR o corrección menor.

### Verificación (no asumida)

- Los 4 nuevos archivos de test (11 tests, incluyendo el criterio de validación obligatorio de Fase
  3 y el criterio adicional de persistencia exacta de versión) — **todos pasan**.
- Suite completa del backend (`npx jest`): **25 suites, 117 tests, todos pasan** — cero regresión en
  los 47 call sites reales.
- `npx tsc --noEmit`: cero errores nuevos. Los 2 errores preexistentes (`TECH_DEBT.md` Item 6, ya
  conocidos y no relacionados) siguen presentes, sin cambios, en archivos no tocados por esta AR.

### Qué NO se hizo (consistente con el alcance de Fase 3)

- No se generalizó la bitácora de auditoría a los 4 aggregates (Opción C — fuera de alcance).
- No se implementó `fromSnapshot`/`reconstitute` (gap de rehidratación — fuera de alcance).
- No se tocó `Reminder`/`Device` (fuera de alcance, `Reminder` sigue sin contador de versión).
- No se corrigió el defecto idéntico de `InMemoryEventStore` (fuera de alcance del punto 3).

---

## AR-028 — CERRADA (2026-07-20)

Ciclo completo: Análisis → Modelo Arquitectónico → Alternativas → Decisión → Diseño Técnico →
Implementación, con verificación real (tests + tsc), no asumida. Segunda remediación del programa
completada de principio a fin, la primera genuinamente técnica — validando (parcialmente; falta el
checkpoint formal tras AR-043 y una AR de Wave 4) que el proceso sostiene el mismo rigor fuera de
casos de gobernanza pura.
