# AR-048 — Offline First (0% real; único doc de diseño es de un stack Flutter abandonado)

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 36 AR pendientes)

Parseadas todas las filas no cerradas de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-045 (36 de
54; 18 cerradas, AR-052 en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por
(Impacto desc, Esfuerzo asc, Riesgo asc). **AR-048 es la única candidata con Impacto Alto entre las
que tienen dependencias resueltas** — ninguna otra AR pendiente con dependencias resueltas alcanza
Impacto Alto (la siguiente franja es Impacto Medio). Sus 2 dependencias declaradas (AR-001, AR-028)
están ambas cerradas. Owner=Ambos.

### Pregunta de framing que gobierna esta fase

> **¿Sigue vigente el hallazgo original en su totalidad, o la propia auditoría ya estableció una
> precondición de secuenciación (persistencia real del backend decidida) que ninguna AR posterior ha
> cumplido — y si es así, cómo trata esto el Roadmap ya existente?**

Se formula así porque el hallazgo original no es solo "falta esta capacidad" — trae su propia
recomendación explícita de **no construirla todavía**, condicionada a una decisión arquitectónica que
(según la evidencia recogida en todo este programa) sigue sin tomarse.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-3-escalabilidad/11-offline-first.md`, It.11),
Prioridad **Media** en la auditoría original (no Alta — el Roadmap la reclasificó a Impacto Alto):

- **Cero capacidad offline real.** `apps/mobile/package.json` sin dependencia de base de datos local
  (`async-storage`, `expo-sqlite`, MMKV, WatermelonDB); `query-client.ts` sin `persistQueryClient` ni
  `onlineManager`; cero ocurrencias de `NetInfo`/`isConnected`/`networkMode` en todo `apps/mobile/src`.
- **Flags de capacidad `offline`/`supportsOffline` inertes** en
  `src/features/dashboard/registry/default-widgets.ts` — declaradas pero sin ningún consumidor en
  `engine/`/`ui/`.
- **Optimistic UI real, pero solo para `Commitment`** (`useCreateCommitment.ts`,
  `useEditCommitment.ts`, `useCommitmentActions.ts`) — no confirmado en la auditoría original para
  Task/Habit/Goal.
- **`docs/02-domain/offline_sync_engine.md`** escrito para un stack Flutter abandonado (cita textual:
  _"El Sync Engine opera mediante un ciclo de estados controlado en Flutter"_), ya identificado como
  uno de los 7 documentos pre-Framework obsoletos.
- **`PRODUCT_VISION.md`** afirma en presente, como Core Principle: _"Offline by design – core
  features work without connectivity"_ — una sobre-declaración que la propia auditoría marcó como
  riesgo a corregir.
- **Riesgo de secuenciación explícito, el más importante señalado por la auditoría:** _"even if
  offline-first were built today, it would have nothing durable to reconcile against — the backend
  has no real persistence... Building a client-side sync engine before backend persistence is decided
  would mean designing a reconciliation protocol against a moving, undecided target."_
- **Recomendación #1 de la auditoría, textual:** _"Do not build offline-first now... Sequence this
  after that decision, not before."_

**Verificado hoy, punto por punto — todo permanece exactamente igual, cero cambios:**

- `apps/mobile/package.json`: cero dependencias de almacenamiento local (grep exhaustivo,
  `async-storage`/`sqlite`/`mmkv`/`watermelon`/`netinfo`, cero coincidencias).
- `query-client.ts`: configuración idéntica a la citada por la auditoría, sin persistencia ni
  detección de red.
- `default-widgets.ts`: 12 declaraciones de `offline`/`supportsOffline` sobre 11 widgets, **cero
  consumidores** en `engine/`/`ui/` (grep exhaustivo, igual que la auditoría).
- Optimistic UI (`onMutate`) sigue confinada exclusivamente a `Commitment` — verificado hoy contra
  `apps/mobile/src/features/{tasks,habits,goals}`, cero archivos con `onMutate`, pese a que estos tres
  módulos crecieron significativamente desde la auditoría (backend de Task/Habit/Goal completo,
  AR-030, navegación de detalle AR reciente). La brecha no se cerró — se mantuvo constante mientras el
  resto del producto avanzaba.
- `PRODUCT_VISION.md` (`docs/01-product/PRODUCT_VISION.md:32`) sigue afirmando en presente: _"Offline
  by design – core features work without connectivity."_ Sin corrección, sin AR que lo haya tocado.
- `docs/02-domain/offline_sync_engine.md`: **ya formalmente clasificado por AR-003** en
  `docs/02-domain/CLASSIFICATION_STATUS.md` como **"Histórico (íntegro)"** — _"Escrito explícitamente
  para Flutter... AR-001 confirmó React Native+Expo como stack oficial. Cero opción normativa viva,
  cero evidencia reutilizada."_ Esto no estaba resuelto en el momento de la auditoría original; ahora
  sí — la clasificación ya existe, no hay que producirla en esta AR.

### 2. La precondición de secuenciación de la auditoría sigue sin cumplirse

Verificado directamente, no asumido: los 7 aggregates reales del backend siguen sobre repositorios en
memoria (21 archivos `*.repository.ts` bajo `in-memory`), confirmado repetidamente a lo largo de este
programa (AR-028, AR-043, AR-045, AR-047, AR-050) — **AR-028 introdujo concurrencia optimista, no
persistencia real**, un hecho ya establecido y vuelto a verificar en cada una de esas ARs. Cero
referencias a Postgres/una base de datos real en `apps/backend/src`. **La precondición que la propia
auditoría fijó como bloqueante ("resolver primero la estrategia de persistencia real del backend")
no se ha cumplido todavía por ninguna AR cerrada del programa.**

**Hallazgo adicional: la cita concreta de la auditoría no tiene respaldo real.** La auditoría remite
la precondición a _"docs/00-framework/REVIEW_STATUS.md (Framework Freeze Preparation, priority 1: 'Is
there a planned trigger for actually implementing real persistence?')"_ — verificado hoy: ni
`REVIEW_STATUS.md` ni `FRAMEWORK_FREEZE_PREPARATION.md` contienen ese texto ni ninguna pregunta sobre
persistencia; las prioridades reales de `FRAMEWORK_FREEZE_PREPARATION.md` (ADR-019/020 vs. Chapter 4,
`PRODUCT_VISION.md` vs. Chapter 9, documentos legacy, tensión de streaks) son un tema completamente
distinto. Mismo patrón que este programa ya encontró repetidamente (AR-023↔AR-025/048/049/050,
AR-043↔AR-030, AR-045↔AR-043, AR-003↔AR-001): **la sustancia del hallazgo (persistencia real no
resuelta) sigue siendo cierta y verificable independientemente**, pero la cita concreta que la
auditoría usó para respaldarla no existe en el documento que dice citar.

### 3. El propio Roadmap ya intentó resolver la tensión, con un resultado parcial

El Roadmap (fila AR-048) ya no trata "Offline First" como un bloque monolítico: separa explícitamente
**almacenamiento local + cola de mutaciones** (AR-048) de **reconciliación/motor de sincronización**
(AR-049), y declara que solo la reconciliación depende de OCC del servidor — dependencia ya cerrada
por AR-028. Verificado: la fila de AR-028 en el propio Roadmap confirma esta relación
(`Bloquea: AR-049 (parcial — reconciliación; ver nota en AR-048)`). Esta es una relectura
técnicamente defendible del riesgo de la auditoría (que ligaba el riesgo específicamente a la
_reconciliación_ contra un backend sin persistencia real, no al almacenamiento local en sí).

**Pero el encabezado de la propia Wave 6 contradice esa relectura.** El objetivo declarado de la Wave
es _"las capacidades más diferenciadoras del producto — deliberadamente después de resolver
persistencia real (Wave 3)"_ — **Wave 3 no resolvió persistencia real.** Wave 3 (Consistencia
Arquitectónica) contiene exactamente AR-028, cuyo propio registro (`AR-028/ANALISIS.md`, y su fila del
Roadmap) documenta que introdujo compare-and-swap sobre almacenamiento **en memoria**, explícitamente
sin persistencia real. El Roadmap afirma en un lugar que la precondición ya se cumplió (encabezado de
Wave 6) y en otro que la dependencia real es más estrecha de lo que la auditoría pedía (fila AR-048) —
dos afirmaciones que no son plenamente consistentes entre sí, y ninguna de las dos citó nunca
`AR-028/ANALISIS.md` directamente para sostenerlo hasta esta verificación.

### Respuesta a la pregunta de framing

> **El hallazgo original se confirma vigente en su totalidad — cero capacidad offline, flags inertes,
> optimistic UI limitado a `Commitment`, documento de diseño obsoleto, afirmación de producto
> desactualizada — sin ningún cambio desde la auditoría.** La precondición de secuenciación que la
> propia auditoría fijó (resolver primero la estrategia de persistencia real del backend) **no se ha
> cumplido**: la cita literal que la auditoría usó para respaldar esa precondición no existe en el
> documento citado, pero la sustancia (persistencia real no resuelta) es verificable de forma
> independiente y sigue siendo cierta. **El propio Roadmap ya intentó acotar el riesgo** separando
> almacenamiento/cola local (AR-048) de reconciliación (AR-049, sí bloqueada correctamente), pero el
> encabezado de Wave 6 afirma incorrectamente que la Wave 3 ya "resolvió persistencia real" — no lo
> hizo, solo añadió concurrencia optimista sobre almacenamiento en memoria.

**Consecuencia para el alcance de AR-048:** a diferencia de AR-002/AR-009/AR-045 (donde Fase 1 reducía
el alcance por resolución parcial), aquí Fase 1 **no reduce el hallazgo — lo confirma íntegro** y
añade una tensión de secuenciación sin resolver que Fase 2 debe abordar explícitamente: ¿la
separación storage/cola (sin reconciliación) que ya propone el Roadmap es una forma legítima de
avanzar sin violar la recomendación de la auditoría, o el "no construir esto todavía" de la auditoría
aplicaba al conjunto completo, incluyendo el almacenamiento local? Esta pregunta no se resuelve aquí —
es precisamente la pregunta de framing que corresponde formalizar y decidir en Fase 2.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

A diferencia de varias remediaciones recientes, aquí **el problema sigue existiendo íntegramente** —
no hay hallazgo absorbido ni propiedad ya implementada que reduzca el alcance. La pregunta pasa a ser
si la recomendación original de la auditoría ("no construir esto todavía") sigue siendo la decisión
arquitectónica correcta bajo el estado actual del sistema.

**H1 (principal):** _"AR-048 debe introducir la arquitectura que haga posible una capacidad Offline
First futura, pero sin implementar sincronización offline completa mientras la persistencia canónica
del backend siga siendo insuficiente para soportarla de forma correcta."_ Explica toda la evidencia:
no existe capacidad offline real; los flags permanecen inertes; `onMutate` sigue siendo un caso
aislado; `PRODUCT_VISION.md` sigue sin alinearse; la auditoría condicionó expresamente la
implementación completa a una persistencia adecuada; AR-028 añadió OCC, pero no convirtió el backend
en una persistencia canónica completa.

**Hipótesis alternativas descartadas:**

- **H2** — implementar Offline First completo ahora. Descartada: la propia auditoría estableció una
  precondición técnica y la evidencia indica que sigue sin cumplirse; ignorarla significaría ignorar
  una restricción todavía vigente.
- **H3** — posponer AR-048 íntegramente hasta resolver persistencia. Descartada: impediría preparar
  la arquitectura para una futura sincronización y mantendría el sistema sin separación conceptual
  entre almacenamiento local, cola y sincronización — la ausencia de persistencia completa no impide
  estabilizar contratos arquitectónicos.
- **H4** — la separación storage/cola/sync que ya propone el Roadmap resuelve el problema por sí
  sola. Descartada como hipótesis principal: en este momento es únicamente una posibilidad de diseño,
  sin evidencia todavía de que esa separación satisfaga por sí sola el condicionamiento original de la
  auditoría — corresponde a Fase 4, no a Fase 2.

**H1 sobrevive**, formulada con mayor precisión: _"El objetivo de AR-048 no es entregar Offline First
funcional, sino estabilizar una arquitectura Offline First que permanezca compatible con la futura
persistencia real del sistema, sin introducir dependencias incorrectas entre almacenamiento local y
sincronización."_

**Tres conceptos distintos, separados explícitamente para no confundirlos:**

1. **Capacidad Offline** — la propiedad arquitectónica final (offline funcional de extremo a
   extremo). Todavía no existe.
2. **Arquitectura Offline** — los límites entre almacenamiento local, cola, sincronización y
   resolución de conflictos. Sí puede comenzar a estabilizarse.
3. **Persistencia canónica** — la fuente de verdad del backend. Continúa siendo una dependencia
   externa a AR-048; no debería resolverse aquí.

**La tensión encontrada en Fase 1, reformulada como la pregunta real de Fase 2:** no es _"¿existe
persistencia?"_ — es _"¿la separación propuesta permite construir la arquitectura Offline sin asumir
que la sincronización ya puede funcionar correctamente?"_ La evidencia recogida hasta ahora no
responde todavía a esa pregunta.

**Expectativa registrada para Fase 2B, sin resolverla aquí:** si H1 se mantiene, D-048.1 debería
congelar que la plataforma separe explícitamente las responsabilidades de almacenamiento local,
gestión de operaciones pendientes y sincronización con el backend, de modo que la sincronización
pueda incorporarse cuando exista una persistencia canónica suficiente, sin rediseñar la arquitectura
Offline — dejando abiertas sincronización real, resolución de conflictos, políticas de reintento,
almacenamiento físico y mecanismos de reconciliación para fases posteriores.

**Observación registrada, no promovida:** AR-048 podría repetir el patrón de AR-050 en otro dominio —
primero estabilizar la plataforma/arquitectura independiente (la plataforma de IA en AR-050, la
arquitectura Offline storage/cola/sync aquí), dejando que la implementación dependiente (el proveedor
LLM allí, la sincronización real aquí) se materialice cuando las condiciones lo permitan, sin reabrir
la decisión ya congelada.

---

## Estado

**Fase 1 y Fase 2A cerradas.** Hallazgo original confirmado íntegramente vigente. H1 sobrevive:
AR-048 debe estabilizar la arquitectura Offline (límites entre storage/cola/sincronización) sin
implementar sincronización offline completa mientras la persistencia canónica del backend siga
siendo insuficiente. H2/H3/H4 descartadas. 3 conceptos separados (Capacidad Offline / Arquitectura
Offline / Persistencia canónica). Pendiente: **Fase 2B (Decisión)**. Estado: se mantiene 🟦 En
análisis. Decisión: se mantiene 💭 Pendiente de análisis (pendiente de que el usuario congele D-048.1
en Fase 2B).
