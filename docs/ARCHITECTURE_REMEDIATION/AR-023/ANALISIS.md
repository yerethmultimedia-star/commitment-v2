# AR-023 — Dos clases base `AggregateRoot` incompatibles

Registro completo, siguiendo el ciclo validado en AR-001 y AR-028: `Análisis → Verificación del
framing → Modelo arquitectónico (si aplica) → Alternativas → Decisión → Diseño técnico (si aplica) →
Implementación → Validación → Dashboard`.

---

## Fase 1 — Evidencia

**Estado: 🟦 En progreso.** Objetivo distinto a AR-001/AR-028: no evaluar si el hallazgo es correcto,
sino si **sigue mereciendo ser el nodo de mayor centralidad del grafo** — la centralidad se calculó
sobre un grafo construido antes de ejecutar AR-001 y AR-028, y ese grafo ya demostró no ser inmutable
dos veces.

### 1. Hallazgo original (texto literal, Iteración 1 — `fase-1-nucleo/01-ddd.md`)

> _"Two incompatible `AggregateRoot` base classes exist in the same package. `core/aggregate-root.base.ts`
> (...) is a separate, parallel implementation from `shared/aggregate-root.ts` (...). All seven real
> aggregates (...) use `shared/aggregate-root.ts`. The `core/` version has exactly one consumer:
> `appearance/models/appearance.model.ts`."_

Prioridad original: **Media**. Riesgo original: condicional — _"if and when `AppearanceModel` is
wired into a shared event-sourced persistence path alongside the seven aggregates... Low likelihood
today."_

### 2. Evidencia actual del código — verificada, sin cambios desde la auditoría

- `core/aggregate-root.base.ts`: exactamente **1 consumidor** (`appearance/models/appearance.model.ts`).
- `shared/aggregate-root.ts`: exactamente **7 consumidores** (Identity, Habit, Commitment, Task,
  Reminder, Goal, Device) — los mismos 7 aggregates reales de siempre.
- Confirmado que AR-028 (concurrencia optimista, tocó versionado/repositorios/persistencia en los 4
  aggregates principales) **no necesitó tocar ninguna de las dos clases** — usó `shared/` directamente
  sin fricción.

### 3. ¿Quién depende realmente de AR-023? — verificado contra el código, no asumido

- **AR-025** (puertos de repositorio duplicados) — el roadmap lo lista como dependiente. Grep
  exhaustivo sobre las 7 interfaces de repositorio de dominio (`shared/repository.interface.ts`,
  `goal/repositories/goal.repository.ts`, etc.): **cero referencias a `AggregateRoot`** en cualquiera
  de las dos variantes. La dependencia declarada no tiene respaldo en el código.
- **AR-048/049/050** (Wave 6) — todas listan AR-023 como dependencia. El precedente directo de AR-028
  (concurrencia optimista construida sobre los 7 aggregates reales sin tocar AR-023) sugiere que esta
  dependencia también puede ser heredada de afinidad conceptual, no de necesidad ejecutable — pero no
  verificada todavía, porque ninguna de esas 3 ha entrado a su propia Fase 1.

### 4. ¿Qué riesgo elimina? — Hallazgo que refina el original

Rastreado `AppearanceRepository` hasta su implementación real:
`apps/mobile/src/features/appearance/repository/appearance.repository.impl.ts` — persiste vía
`expo-secure-store` en el dispositivo, JSON de `settings` solamente (ni `_version` ni
`_uncommittedEvents` se serializan). Nunca toca el backend, nunca pasa por `InMemory*Repository`
ni por `EventStore`.

**Corrección a una afirmación propia:** inicialmente reporté "cero menciones documentadas de migrar
Appearance a backend." Una búsqueda más amplia (todo el repo, no solo 3 archivos) encontró una real:
**ADR-014** (2026-07-08, Aprobada), sección `Appearance`, dice explícitamente:

> _"Estrategia de Sincronización: el contrato y el puerto de repositorio se diseñan **considerando**
> la sincronización cloud: `Appearance` -> local cache -> backend profile -> otros dispositivos,
> **aunque inicialmente la implementación del adaptador persista en Secure Storage local**."_

Esto sí es evidencia real de una consideración de diseño documentada — no puede afirmarse "cero
evidencia." **Matiz relevante, no una refutación de esa evidencia:** esta misma ADR-014, en su propia
sección de Contexto, es el documento que AR-001 ya identificó con un track record confirmado en este
punto exacto — habla de _"futuras migraciones a PostgreSQL/Supabase"_ que, escrito 6 días después del
pivote real a NestJS, nunca se materializaron como se describían ahí. No es prueba de que la mención
de Appearance corra la misma suerte, pero es contexto legítimo para no asignarle automáticamente el
mismo peso que tendría una mención en un documento sin ese historial. Este peso queda para la
Decisión, no resuelto aquí de forma unilateral.

### 5. ¿Qué pasa si nunca se resuelve?

Las dos jerarquías no interactúan en ningún camino de código real hoy. El costo verificable es de
onboarding/comprensión (dos clases llamadas `AggregateRoot` con semántica de versión distinta) — no
correctness, no seguridad, no escalabilidad alcanzable con el código actual. El escenario de riesgo
original requiere que se cumplan, en secuencia, dos eventos que hoy no están confirmados: (a)
Appearance migra a persistencia de backend, y (b) esa migración se conecta a la misma infraestructura
de OCC que AR-028 acaba de construir (que además está tipada específicamente contra
`AggregateRoot<IdType>` de `shared/` — no compilaría contra la clase de `core/` sin adaptación).

### Intento de refutación del framing heredado

**No sobrevive intacto.** Tres de las cuatro dependencias declaradas del roadmap (AR-025 sin
respaldo alguno; AR-048/049/050 sin verificación propia todavía, apoyadas solo en el mismo patrón de
afinidad conceptual que ya se refutó una vez con AR-028) no demuestran una dependencia ejecutable
("si no implemento A, B no puede implementarse correctamente") — la prueba que sí distingue una
dependencia arquitectónica real de una afinidad temática.

### Hipótesis de trabajo (no aceptada todavía como decisión)

**H-023.1:** AR-023 no es un nodo estructural del programa; es una remediación de higiene
arquitectónica con impacto principalmente en mantenibilidad y comprensión del código — no en
correctness, seguridad, ni escalabilidad alcanzable hoy.

### Ajuste al grafo — degradación, no eliminación

Siguiendo la distinción del usuario ("no existe evidencia de que bloquee" ≠ "no bloquea"): las
dependencias de AR-025 y AR-048/049/050 sobre AR-023 se marcan como **"Dependencia no verificada"**,
no se eliminan. Se confirmarán o descartarán definitivamente cuando cada una de esas ARs entre a su
propia Fase 1 — no antes, y no por inferencia desde aquí.

### Ponderación de evidencia (herramienta metodológica nueva, generalizable — ver README)

Resuelto por el usuario con una escala de 4 niveles de confianza, aplicable a cualquier AR futura
que necesite pesar evidencia documental contra evidencia de implementación:

1. **Evidencia de implementación** (código, tests, call sites reales — ej. AR-028) — peso máximo.
2. **ADR normativa vigente** (una decisión arquitectónica actual, no superada) — peso alto.
3. **ADR prospectiva** (lenguaje de intención/futuro, no de estado actual) — peso medio.
4. **Hipótesis del roadmap** (una dependencia declarada sin verificación propia) — peso bajo.

La mención de ADR-014 sobre Appearance/cloud-sync cae en el nivel 3 — real, pero de alcance
limitado: _"demuestra que en algún momento existió una intención arquitectónica de conectar
Appearance con infraestructura de backend. No demuestra que el proyecto siga persiguiendo ese
objetivo, que exista implementación, roadmap vigente, o decisiones posteriores que mantengan esa
intención."_ **Principio explícito, no descontar por el historial del documento** (el track record
de ADR-014 con la migración a Postgres/Supabase no materializada no se usa para invalidar esta
mención — eso sería juzgar el documento, no la evidencia): _"la evidencia se pondera según lo que
realmente demuestra, no según el prestigio o el historial del documento que la contiene."_

### H-023.1 — versión final, cerrada

> **AR-023 es actualmente una remediación de higiene arquitectónica con un riesgo evolutivo
> documentado, pero cuya activación depende de una evolución del producto que hoy no está
> respaldada por la implementación ni por un roadmap vigente.**

Reemplaza la formulación anterior ("riesgo condicional... de baja fiabilidad histórica" — rechazada
por el usuario: sonaba a juicio sobre el documento, no sobre lo que la evidencia demuestra). Esta
versión reconoce ADR-014 como intención arquitectónica histórica real, sin concederle más autoridad
de la que demuestra: **"existe un riesgo condicional documentado cuya materialización no ha sido
corroborada por la implementación ni por decisiones arquitectónicas posteriores."** Tres hechos
objetivos siguen sosteniendo la conclusión pese a la nueva evidencia: Appearance sigue
completamente aislado; no existe backend para Appearance; ninguna AR ejecutada (AR-001, AR-028)
necesitó tocar esta jerarquía.

### Estado de cierre de Fase 1

**✅ Cerrada (2026-07-20).** H-023.1 aceptada en su forma final. AR-023 degradada de "nodo
bloqueante de mayor centralidad" a "higiene arquitectónica con riesgo evolutivo condicional, baja
urgencia." Dependencias de AR-025 y AR-048/049/050 sobre AR-023 marcadas como **"Dependencia no
verificada"** en el roadmap — ni confirmadas ni eliminadas, pendientes de que cada AR las valide en
su propia Fase 1.

---

## Fase 2 — Modelo Arquitectónico

**Estado: ✅ Cerrada (2026-07-20).** Pregunta de diseño: _¿las dos implementaciones de
`AggregateRoot` representan realmente el mismo concepto arquitectónico?_

### Cronología decisiva

| Archivo                                       | Fecha de creación | Commit    |
| --------------------------------------------- | ----------------- | --------- |
| `core/aggregate-root.base.ts`                 | 2026-07-02 04:59  | `e135012` |
| ADR-001–010 (incluye ADR-002, Event Sourcing) | 2026-07-02 02:14  | `c81a3ed` |
| Bootstrap real de NestJS                      | 2026-07-02 03:27  | `8900fee` |
| `shared/aggregate-root.ts`                    | 2026-07-04 01:00  | `7966f06` |
| `appearance.model.ts`                         | 2026-07-09        | `fe279de` |

`core/` nació ~90 minutos después de ADR-002 (Event Sourcing) — la misma ventana de bifurcación
día-uno que AR-001 ya encontró a nivel de plataforma. `shared/` nació 2 días después, cuando el
patrón realmente adoptado (CQRS de estado versionado, ADR-021) empezó a construirse. `Appearance` se
escribió 5-7 días más tarde, cuando `shared/` ya era la base activa y establecida — y aun así se
construyó sobre `core/`.

### Las 4 comparaciones

1. **API pública:** casi idéntica en superficie, pero `core/` exige una etiqueta `aggregateType`
   autodescriptiva y tiene un modelo de identidad mutable (setter protegido o rellenado durante
   replay); `shared/` usa un ID tipado e inmutable fijado en construcción.
2. **Responsabilidades — por diseño:** distintas. `core/.recordEvent()` confía en
   `event.metadata.aggregateVersion` (rehidratación Event Sourcing genuina); `shared/` autoincrementa
   localmente (bookkeeping de OCC sobre estado versionado, exactamente el modelo de ADR-021/AR-028).
   **En la práctica:** `Appearance.applyEvent()` está vacío y `updateSettings()` nunca llama a
   `recordEvent()` — muta el campo directamente. No ejercita ninguna capacidad distintiva de `core/`.
3. **Dependencias:** ninguna depende de infraestructura externa directamente; `core/` asume
   implícitamente un Event Store real (nunca construido, ADR-021 lo rechazó); `shared/` asume un
   repositorio de estado versionado (lo que las 4 aggregates reales usan hoy).
4. **Razón histórica:** `core/` es el artefacto táctico de la visión de Event Sourcing (ADR-002) ya
   abandonada en la práctica. **Eliminado del análisis, por instrucción del usuario:** cualquier
   explicación de "por qué" `Appearance` eligió `core/` (accidente, autocomplete, copia de código) —
   no hay evidencia que la sustente y no es necesaria para decidir.

### Búsqueda adicional exigida — ¿algún consumidor, en todo el repo, ejercita las capacidades

exclusivas de `core/`?

Grep exhaustivo, todo el repositorio, no solo producción:

- **`Appearance` (producción):** importa `core/`, nunca ejercita `recordEvent()`/`loadFromHistory()`/`aggregateType` con propósito real.
- **`DummyAggregate` (`core/__tests__/aggregate-root.spec.ts`):** único lugar que sí ejercita las 3
  capacidades — pero es un fixture sintético definido dentro del propio spec, para probar la clase
  base **en aislamiento**. No representa ninguna necesidad de dominio real.
- **`aggregateType`:** leído en cero lugares fuera de su propia declaración y las 2 subclases que la
  declaran — muerto incluso dentro del propio diseño de `core/`.

**Resultado: cero consumidores de dominio real, en producción o en tests, ejercitan las capacidades
distintivas de Event Sourcing de `core/` con propósito de negocio.**

### H-023.3 — aceptada, reemplaza a H-023.2

> **`core/AggregateRoot` es un remanente coherente de una arquitectura descartada (Event Sourcing,
> ADR-002), mientras que `shared/AggregateRoot` es la implementación coherente de la arquitectura
> finalmente adoptada (CQRS de estado versionado, ADR-021). El problema no es interno a ninguna de
> las dos clases — es contextual: existe una implementación plenamente coherente de `AggregateRoot`
> para una arquitectura que ya no es la vigente, y su único consumidor conocido no utiliza ninguna
> de las capacidades que justificarían esa elección.**

**Corrección metodológica aceptada del usuario:** no se afirma "accidental" — no hay evidencia de
por qué `Appearance` eligió `core/`, y esa explicación no es necesaria para decidir. Tampoco se
adopta la analogía "AR-001 a nivel táctico" en su forma fuerte — AR-001 demostró una bifurcación que
produjo dos arquitecturas completas coexistiendo documentalmente; aquí solo se demuestra una
bifurcación que dejó dos implementaciones del mismo rol arquitectónico. Analogía más precisa, no la
misma escala.

### Estado de cierre de Fase 2

**✅ Cerrada.** El framing pasa de "hay dos AggregateRoot" a la formulación de H-023.3. Con la
búsqueda de consumidores confirmando cero necesidad viva de las capacidades de `core/`, la Opción C
(eliminar `core/` si ninguna arquitectura vigente la necesita) queda con más respaldo que al abrir
esta fase — sin decidir todavía, eso corresponde a Fase 2B (Alternativas).

---

## Fase 2B — Alternativas

**Estado: 🟦 En progreso.** Cambio de objeto de evaluación (instrucción del usuario): ya no se
evalúan hipótesis, se evalúan **estados finales de la arquitectura**. Cada opción responde el mismo
conjunto de preguntas antes de compararlas.

### Prueba de refutación aplicada primero a la opción aparentemente favorita (Opción C)

**Hipótesis a destruir:** _"Eliminar `core/AggregateRoot` produciría una pérdida arquitectónica que
hoy todavía no estamos viendo."_

**Evidencia encontrada — la hipótesis sobrevive parcialmente, no se refuta por completo:**

- Re-verificado el texto exacto de **ADR-021** (no el resumen): _"Migrar a Event Sourcing real...
  **Sigue siendo válida a más largo plazo**, pero la carga de la prueba no está satisfecha
  todavía"_ y _"(Alternativa C evaluada y no elegida). **Sigue siendo una dirección válida a largo
  plazo** si en algún momento aparece evidencia... — no antes."_ Esto es **nivel 2 de la escala de
  ponderación** (ADR normativa vigente), no nivel 3 (prospectiva) — la alternativa fue evaluada, no
  elegida, y **explícitamente no descartada**.
- Verificado que el patrón específico de `core/` (un `AggregateRoot` que reconstruye su identidad
  completa desde el replay de eventos, confiando en `event.metadata.aggregateVersion`) **no está
  duplicado en ningún otro lugar del código** — `InMemoryEventStore.saveEvents()` hace OCC sobre la
  posición del stream, pero no ese patrón de rehidratación a nivel de instancia. `core/` es la única
  implementación de ese patrón en todo el repositorio.

**Límite impuesto por el usuario, aceptado:** no se da el salto de "`core/` es la implementación
oficial de esa alternativa futura" — eso no está demostrado. Solo está demostrado que es "la única
implementación existente del patrón, coherente con esa alternativa, reutilizable" — no que ADR-021
la designe como referencia.

### Nuevo criterio de evaluación (quinto, añadido esta fase — ver herramienta permanente en README)

**Preservación de opciones arquitectónicas.** No toda remediación debe optimizar solo el presente —
eliminar código reduce el coste actual, pero también puede reducir el espacio de decisiones futuras.
Ese coste debe valorarse por separado del coste de mantenimiento operativo.

**Distinción clave que emerge de este criterio:** `core/` cumple dos funciones separables —
(1) código ejecutable (sin consumidores reales, valor bajo) y (2) artefacto de conocimiento
arquitectónico (representa una implementación concreta de una decisión que ADR-021 mantiene
abierta — valor real). Deben evaluarse por separado, no como una sola pregunta de "¿se usa o no?".

### Las 3 opciones, reformuladas contra los 5 criterios (consistencia, complejidad, código muerto,

riesgo, preservación de opciones)

**Opción A — Migrar `Appearance` a `shared/AggregateRoot`.** Elimina la inconsistencia operativa
(Appearance dejaría de usar una base class cuyas capacidades nunca ejercita). Introduce complejidad
mínima (Appearance no usa `recordEvent()`/`loadFromHistory()`, la migración es mecánica). No
resuelve por sí sola qué pasa con `core/` como artefacto de conocimiento.

**Opción B — reformulada, ya no es "mantener dos jerarquías."** Ahora es: **"Conservar `core/`
explícitamente como implementación de referencia de la Alternativa C de ADR-021, dejando claro que
no forma parte de la arquitectura operativa actual."** Su carga de la prueba baja significativamente
tras el hallazgo de esta fase — ya no necesita justificar un futuro hipotético sin respaldo; tiene
una ADR normativa vigente que mantiene esa dirección abierta.

**Opción C — Eliminar `core/`.** Su carga de la prueba **sube** tras el hallazgo — debe demostrar
que el beneficio de simplificar supera la pérdida de la única referencia funcional y ya probada
(vía `DummyAggregate`) de una alternativa arquitectónica que ADR-021 no descartó.

### Ranking del usuario, actualizado

Antes de este hallazgo: `C > A > B`. Después: **`A ≈ B > C`** — no porque B haya ganado consumidores
(sigue sin tenerlos), sino porque dejó de ser "código sin uso" para pasar a ser una función de
preservación de conocimiento arquitectónico con respaldo normativo.

### Resuelto: A y B no son mutuamente excluyentes — son respuestas a dos problemas distintos

**Problema 1 — ¿qué debe usar la arquitectura operativa?** Respuesta madura: `shared/AggregateRoot`.
No solo por ser la implementación vigente — coincide con ADR-021, con AR-028 (concurrencia
optimista, ya construida sobre las 7 aggregates de `shared/`), y con los 7 aggregates reales sin
excepción. Esto lo resuelve la Opción A, independientemente de qué se decida sobre `core/`.

**Problema 2 — ¿qué hacemos con el conocimiento asociado a la alternativa Event Sourcing?** Ya no es
un problema operativo — depende de ADR-021, no de Appearance. Ejecutar A no lo resuelve ni lo
prejuzga; solo dispone del problema 1, dejando a `core/` en su forma más limpia (cero consumidores)
para que el problema 2 se decida sobre sus propios méritos.

**Árbol de decisión, no 3 ramas independientes:**

```
1. ¿Cuál es la AggregateRoot operativa? → shared/ (madura)
2. ¿Qué hacemos con la referencia Event Sourcing? → Conservar o Eliminar (abierta, ver D-023.2)
```

### D-023.1 — Decisión (madura, lista para Fase 4 de AR-023)

> **La arquitectura operativa utiliza exclusivamente `shared/AggregateRoot`. `Appearance` migra
> desde `core/aggregate-root.base.ts` hacia `shared/aggregate-root.ts`.**

Evidencia que la sostiene: coincide con ADR-021 (estado versionado como fuente de verdad), con el
patrón ya construido en AR-028, y con los 7 aggregates reales. Appearance no pierde nada al migrar —
ya confirmado que nunca ejercita las capacidades distintivas de `core/` (`applyEvent` vacío,
`recordEvent` nunca llamado).

### D-023.2 — Pregunta de gobernanza, deliberadamente NO resuelta aquí (trasciende AR-023)

> **¿Debe el repositorio contener implementaciones de arquitecturas deliberadamente no activas,
> únicamente porque siguen siendo alternativas abiertas (per una ADR normativa vigente)?**

Esta pregunta no es específica de `core/aggregate-root.base.ts` — es una política de gobernanza
reutilizable para cualquier futuro artefacto en la misma situación (código sin consumidores, pero
representando una alternativa que una ADR vigente mantiene abierta). No hay evidencia suficiente
reunida en esta AR para responderla con el mismo rigor que D-023.1. **Recomendación: separar en su
propia AR** (candidata: AR-052, ver roadmap) en vez de resolverla dentro del alcance de AR-023 — de
lo contrario, AR-023 quedaría bloqueada por una pregunta más amplia que la que originó su apertura.
