# AR-049 — Sync Engine / Conflict Resolution (0% real; el diseño existente depende de Event Sourcing, que ADR-021 ya rechazó)

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 34 AR pendientes)

Parseadas todas las filas no cerradas de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-048 (34 de
54; 20 cerradas, AR-052 en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por
(Impacto desc, Esfuerzo asc, Riesgo asc). **AR-049 es la única candidata con Impacto Alto entre las
que tienen dependencias resueltas** — sus 3 dependencias declaradas (AR-001, AR-028, AR-048) están
las 3 cerradas; ninguna otra AR pendiente con dependencias resueltas alcanza Impacto Alto (la
siguiente franja es Impacto Medio). Owner=Ambos (requiere ADR).

### Pregunta de framing que gobierna esta fase

> **¿Sigue vigente el hallazgo original de Sync Engine, y qué cambió exactamente con el cierre de
> AR-028, AR-003 y, sobre todo, AR-048 — que acaba de construir el componente arquitectónico
> (`SynchronizationEngine`) que este mismo hallazgo dice que no existe?**

Se formula así porque el propio Roadmap ya dejó una nota explícita al cerrar AR-048: _"el
`SynchronizationEngine` congelado allí (D-048.1, Fase 4A) es el punto exacto donde esta AR debe
materializar la reconciliación real, sin rediseñarlo."_ Antes de aceptar ese encargo hay que verificar
si sigue siendo correcto.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-3-escalabilidad/12-sync-engine.md`, It.12),
Prioridad **Media** en la auditoría original:

- **Cero mecanismo de sincronización o resolución de conflictos en ningún lugar del código** — grep
  exhaustivo (`conflict resolution|vector clock|CRDT|last-write-wins|sync engine|sync queue|reconcil`)
  con exactamente 1 coincidencia, no relacionada (un comentario de modelado de datos).
- **Este hallazgo depende directamente de It.11 (Offline First):** _"con cero almacenamiento local
  durable y cero encolado de mutaciones, no existe estado hecho-offline que necesite reconciliarse
  algún día — 'Sync' como capacidad distinta no tiene sustrato sobre el que operar hoy."_
- **El diseño existente (`offline_sync_engine.md` §4) es arquitectónicamente incompatible con la
  arquitectura ya decidida** — su algoritmo de reconciliación depende de recalcular el estado local
  re-aplicando eventos reordenados (Event Sourcing real); ADR-021 (vigente) ya rechazó explícitamente
  Event Sourcing en favor de CQRS con estado versionado plano. No es solo "diseñado para el stack
  equivocado" (framing de It.11) — su mecanismo central de resolución de conflictos necesitaría
  rediseñarse desde cero, independientemente del framework cliente.
- **El riesgo real y presente que la propia auditoría señala:** _"no existe verificación de
  concurrencia optimista en los repositorios reales de fuente de verdad
  (`InMemoryGoalRepository`/`InMemoryCommitmentRepository`)"_ — escrituras concurrentes ganarían en
  silencio (last-write-wins), sin señal de conflicto, en el servidor, hoy.
- **Recomendación #1 de la auditoría, textual:** _"Do not build a sync engine now... the backend
  persistence-strategy decision is still open."_ Recomendación #3: _"Prioritize [...] real
  optimistic-concurrency checks on the state repositories ahead of any sync work."_

**Verificado hoy, punto por punto:**

1. **Cero mecanismo de sincronización — confirmado, con una única coincidencia nueva y explicable.**
   Mismo grep exhaustivo repetido hoy: 2 coincidencias — el mismo comentario de modelado de datos ya
   citado por la auditoría, y **`apps/mobile/src/core/offline/synchronization-engine.ts`** (AR-048,
   cerrada hoy mismo). Esta segunda coincidencia no contradice el hallazgo: es el contrato
   arquitectónico (`SynchronizationEngine`) y su implementación deliberadamente vacía
   (`NoOpSynchronizationEngine`) — cero lógica de reconciliación, confirmado leyendo el archivo
   completo (`AR-048/ANALISIS.md`, Fase 4B). El hallazgo ("cero mecanismo de sincronización") sigue
   siendo cierto; lo que cambió es que ahora existe el **punto exacto donde ese mecanismo, si se
   construye, debe vivir** — no el mecanismo en sí.
2. **La precondición de It.11 ("no hay estado offline que reconciliar") se refina, no desaparece.**
   AR-048 construyó `OfflineStorage`/`OperationQueue` — un sustrato arquitectónico existe. Pero
   verificado hoy: ningún consumidor real de `apps/mobile` (`TaskForm`, `HabitForm`,
   `CreateCommitmentScreen`, etc.) escribe todavía en ese `OperationQueue` — cero imports de
   `core/offline` fuera de sus propios tests (`grep -rn "core/offline" apps/mobile/src --include="*.tsx"`
   sin resultados). El sustrato arquitectónico existe; el sustrato **poblado por uso real de la
   aplicación** sigue sin existir. La conclusión original ("no hay nada real que reconciliar todavía")
   se mantiene en la práctica, aunque ya no por ausencia total de arquitectura.
3. **El riesgo real de OCC — completamente resuelto por AR-028, verificado, no asumido.** Grep directo
   sobre los 4 repositorios reales: `in-memory-goal.repository.ts`, `in-memory-commitment.repository.ts`,
   `in-memory-task.repository.ts`, `in-memory-habit.repository.ts` — los 4 usan
   `OptimisticConcurrencyError`, exactamente como AR-028 documentó. **La Recomendación #3 de la
   auditoría (priorizar esto antes que cualquier trabajo de sync) ya está satisfecha por una AR
   cerrada hace varias sesiones**, antes incluso de que este programa llegara a AR-048.
4. **ADR-021 sigue vigente, con la misma reserva ya citada por AR-023/AR-003:** _"Migrar a Event
   Sourcing real... es la opción [...]"_ — el mismo tipo de reserva normativa que llevó a AR-023 a
   crear su 5º criterio de evaluación. El diseño de `offline_sync_engine.md` §4 no puede adaptarse
   trivialmente; su mecanismo de resolución de conflictos requiere rediseño completo si el proyecto
   alguna vez construye Sync real.
5. **`offline_sync_engine.md` ya está clasificado.** AR-003 lo clasificó como **"Histórico (íntegro)"**
   en `docs/02-domain/CLASSIFICATION_STATUS.md` — no hay ningún trabajo de clasificación documental
   pendiente aquí; la incompatibilidad de su §4 con ADR-021 ya está implícita en esa clasificación
   (cero opción normativa viva, cero evidencia reutilizada).

### Hallazgo adicional: una cita desactualizada en `PRODUCT_BACKLOG.md`, fuera del alcance de esta AR

`PRODUCT_BACKLOG.md` (reescrito por **AR-004**, commit `5ca84a2`, 2026-07-23 15:03, **antes** de que
AR-048 existiera como trabajo real en esta sesión) afirma: _"Offline Sync (~10% real, ver
`docs/ARCHITECTURE_OVERVIEW.md` §2 — AR-048)"_. Verificado: esa cifra no puede derivarse del trabajo
real de AR-048 (cronológicamente imposible — AR-004 se cerró antes de que AR-048 empezara su propia
Fase 1). Mismo patrón de "cita sin respaldo real" ya encontrado repetidamente en este programa
(AR-023↔AR-025/048/049/050, AR-043↔AR-030, AR-045↔AR-043, AR-048↔`REVIEW_STATUS.md`) — no se corrige
aquí: corregir `PRODUCT_BACKLOG.md` no pertenece al alcance de AR-049, se registra solo para no
confundir el dato con evidencia real de esta AR.

### Respuesta a la pregunta de framing

> **El hallazgo original se confirma vigente, con un refinamiento importante que AR-048 introduce.**
> Cero mecanismo de sincronización real sigue siendo cierto — la única coincidencia nueva es el
> contrato vacío que AR-048 construyó deliberadamente, no una implementación. El riesgo real que la
> auditoría marcó como prioritario (OCC en los repositorios) **ya está resuelto por AR-028**, cerrada
> mucho antes de esta sesión. La precondición de la auditoría para no construir sync ahora
> ("persistencia del backend sin decidir") **sigue sin cumplirse**, exactamente igual que en AR-048. El
> diseño documental existente sigue siendo inadaptable (incompatible con ADR-021), ya clasificado como
> histórico por AR-003 — no hay trabajo documental pendiente.

**Consecuencia para el alcance de AR-049:** a diferencia de AR-048 (que sí tenía una capacidad
arquitectónica legítima para estabilizar ahora mismo, sin depender de la persistencia), AR-049 hereda
directamente la misma restricción que AR-048 ya enfrentó — pero un nivel más adentro: el
`SynchronizationEngine` que debía "recibir" el trabajo de esta AR ya existe como contrato vacío, y
**materializar su comportamiento real requeriría exactamente lo que la auditoría pide no hacer
todavía** (reconciliación real contra un backend sin persistencia canónica decidida). Esta tensión —
¿qué le queda por hacer a AR-049 si el precondition sigue sin cumplirse y el punto de extensión ya
está construido? — no se resuelve aquí; es la pregunta que corresponde a Fase 2.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

La evidencia de Fase 1 cambia significativamente el contexto respecto a la auditoría original.
AR-049 ya no parte de un sistema sin arquitectura Offline — parte de un sistema donde **el punto de
extensión ya existe** gracias a AR-048. La pregunta deja de ser "¿cómo construir un Sync Engine?" y
pasa a ser "¿qué responsabilidad arquitectónica conserva AR-049 bajo las restricciones actuales?".

**H1 (principal):** _"AR-049 debe estabilizar exclusivamente el contrato de reconciliación y
coordinación del `SynchronizationEngine`, sin implementar sincronización efectiva mientras no exista
una persistencia canónica suficiente."_ Consistente con toda la evidencia: AR-028 eliminó el riesgo de
concurrencia (OCC); AR-048 creó el punto de extensión arquitectónico; la persistencia canónica sigue
siendo una precondición no satisfecha; el `SynchronizationEngine` permanece deliberadamente vacío. El
trabajo pendiente ya no es estructural, sino definir **qué hará** ese componente cuando pueda actuar.

**Hipótesis alternativas descartadas:**

- **H2** — implementar sincronización completa ahora. Descartada: sería incoherente con la
  restricción ya aceptada en AR-048 y con la propia recomendación de la auditoría.
- **H3** — AR-049 ya no tiene objeto y debería cerrarse sin cambios. Descartada: aunque la estructura
  exista, todavía falta estabilizar la responsabilidad arquitectónica del `SynchronizationEngine`;
  confundir existencia del componente con definición de su comportamiento sería un salto lógico.
- **H4** — AR-049 debe esperar completamente hasta resolver la persistencia. Descartada: el programa
  ha demostrado varias veces (AR-045, AR-048, AR-050) que puede estabilizar contratos antes de
  disponer de todas las dependencias de implementación — no hay evidencia de que este caso deba
  tratarse de forma distinta.

**H1 sobrevive**, formulada con mayor precisión: _"AR-049 define la responsabilidad arquitectónica de
reconciliación del `SynchronizationEngine`, preservando el desacoplamiento establecido por AR-048 y
posponiendo cualquier sincronización efectiva hasta que la plataforma disponga de persistencia
canónica suficiente."_

**Un refinamiento importante — tres niveles que ya no son los mismos que en AR-048:**

1. **AR-048** define dónde vive la sincronización.
2. **AR-049** define qué responsabilidad tiene la sincronización.
3. **Futuras AR** implementarán cómo sincroniza realmente.

Esa separación evita que AR-049 invada responsabilidades futuras.

**La tensión abierta de Fase 1, resuelta como pregunta de Fase 2:** el punto de extensión ya existe;
lo que aún no existe es el contexto arquitectónico que permita ejecutar reconciliación real. La
pregunta correcta no es "¿podemos sincronizar?" sino **"¿qué contrato debe respetar cualquier
sincronización futura?"** — esa sí pertenece plenamente a AR-049.

**Expectativa registrada para Fase 2B, sin resolverla aquí:** si H1 se mantiene, D-049.1 debería
congelar que el `SynchronizationEngine` sea el único componente responsable de coordinar la
reconciliación entre `OfflineStorage`, `OperationQueue` y la persistencia canónica, permaneciendo
independiente de cualquier mecanismo concreto de transporte, almacenamiento o resolución de
conflictos — dejando abiertos HTTP/WebSockets/polling/push, OCC/CRDT/merge/retries, políticas de
reconciliación y backend específico para implementación futura.

**Observación registrada, no promovida:** AR-049 parece ser la continuación natural de AR-048. Si
AR-048 respondió "dónde debe vivir la sincronización", AR-049 responde "qué responsabilidad exclusiva
tendrá ese componente" — mismo patrón repetido en varias remediaciones: primero estabilizar la
estructura, después el contrato, y solo posteriormente el comportamiento completo cuando las
precondiciones arquitectónicas existan.

---

## Estado

**Fase 1 y Fase 2A cerradas.** Hallazgo original confirmado vigente, refinado por el cierre reciente
de AR-028 (riesgo de OCC ya resuelto), AR-003 (documento ya clasificado) y AR-048 (el punto de
extensión ya existe como contrato vacío). H1 sobrevive: AR-049 debe estabilizar exclusivamente el
contrato de reconciliación del `SynchronizationEngine`, sin implementar sincronización efectiva
mientras la persistencia canónica siga siendo insuficiente. H2/H3/H4 descartadas. Pendiente: **Fase
2B (Decisión)**. Estado: se mantiene 🟦 En análisis. Decisión: se mantiene 💭 Pendiente de análisis
(pendiente de que el usuario congele D-049.1 en Fase 2B).
