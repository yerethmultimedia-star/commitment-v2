# AR-003 — Documentos obsoletos describiendo arquitectura rechazada/superada, presentados como vigentes

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 37 AR pendientes)

Parseadas todas las filas `⬜ Pendiente` de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-050 (37 de
54; 16 cerradas, AR-052 en análisis/pausada). AR-003 empata en el tier superior (Impacto Alto/Esfuerzo
Medio/Riesgo Medio) — el mismo tier donde AR-047 ganó la vez anterior por tener dependencia "Ninguna"
frente a la dependencia parcial de AR-003. Con AR-047 ya cerrada, AR-003 queda como la única candidata
de ese tier: ningún otro pendiente combina Impacto Alto con Esfuerzo Medio (los siguientes en impacto,
AR-045/AR-048, tienen Esfuerzo L/XL). Owner=Ambos.

### Pregunta de framing que gobierna esta fase

> **¿Siguen siendo "7 documentos" con el mismo tratamiento uniforme, o la evidencia muestra que
> requieren al menos dos tratamientos distintos?**

Se formula así porque la propia auditoría de origen (It.19) ya advertía matices dentro del grupo de 7,
y porque este programa ya estableció un precedente directamente relevante (AR-023, 5º criterio:
"Preservación de opciones arquitectónicas") para casos donde un documento describe una dirección
arquitectónica todavía válida, no simplemente rechazada.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-4-produccion/19-documentacion-gobernanza.md`,
consolidando iteraciones 1/5/11): 7 documentos en `docs/02-domain/` describen arquitectura
rechazada/superada, presentados sin ningún aviso de estado obsoleto:

1. `CONCEPTS.md` — vocabulario pre-Framework (Microacción, eventos en español, "Social Context").
2. `bounded_contexts.md` — mismo vocabulario pre-Framework.
3. `domain_state_machines.md` — mismo vocabulario pre-Framework.
4. `postgresql_physical_model.md` — describe Event Sourcing, que ADR-021 rechazó como arquitectura
   presente.
5. `event_store_model.md` — ídem.
6. `read_models.md` — ídem.
7. `offline_sync_engine.md` — escrito para un stack Flutter abandonado.

**Verificado hoy, archivo por archivo — los 7 siguen existiendo, sin cambios:**

- Los 7 conservan su banner `🔒 DOCUMENTO CONGELADO OFICIALMENTE`, con una excepción: **`CONCEPTS.md`
  declara `Status: Active` en su propia cabecera** — no "congelado" como los otros 6. Es el caso más
  urgente del grupo: un documento que se autodeclara vigente mientras describe un vocabulario ya
  reemplazado (confirmado por `docs/00-framework/FRAMEWORK_FREEZE_PREPARATION.md`: `Microacción` con
  límite duro de 3, eventos en español, un bounded context "Social Context (Red de Apoyo)" que el
  propio Apéndice del Framework lista como "Intentionally Removed... simplemente nunca se construyó").
- `offline_sync_engine.md` confirma explícitamente su dependencia de Flutter (_"El Sync Engine opera
  mediante un ciclo de estados controlado en Flutter"_) — AR-001 (cerrada) ya confirmó React
  Native+Expo como stack oficial. Cero tensión: es el caso más simple del grupo, sin ninguna opción
  normativa viva que lo respalde.
- **`postgresql_physical_model.md`/`event_store_model.md`/`read_models.md` no son un caso tan simple
  como "rechazados."** ADR-021 (vigente, ya citado en AR-023/AR-028) dice textualmente: _"Migrar a
  Event Sourcing real... sigue siendo válida a más largo plazo"_ — la misma reserva normativa que llevó
  a AR-023 a **no** eliminar `core/AggregateRoot` y a crear el 5º criterio de evaluación del programa
  ("Preservación de opciones arquitectónicas"). Estos 3 documentos describen exactamente esa dirección
  todavía-válida-pero-no-presente — un candidato directo al mismo tratamiento, no a un archivado sin
  matices.
- **`domain_state_machines.md` no es enteramente prescindible.** `FRAMEWORK_FREEZE_PREPARATION.md` ya
  documentó que su sección "AI Commands" (_"La IA nunca emite un Comando de Dominio de forma
  directa..."_) es _"the one part of it that already matches the new Framework precisely"_ — y
  **AR-047 (cerrada, esta misma sesión) citó exactamente esa sección como evidencia real para D-047.1.**
  Archivar el documento completo sin extraer esa sección primero destruiría la única referencia textual
  de un invariante que el programa ya usó como evidencia operativa.

### Hallazgo adicional: la dependencia declarada con AR-001 no tiene respaldo real

El Roadmap anota "AR-001 (parcial — determina si los 3 docs de persistencia se archivan o se
reactivan)". **Verificado: `AR-001/ANALISIS.md` no menciona ninguno de los 3 documentos de
persistencia ni esta pregunta en ningún punto.** AR-001 resolvió la contradicción ADR-004/NestJS y
reclasificó ADR-001-010 — nunca tocó `postgresql_physical_model.md`/`event_store_model.md`/
`read_models.md`. Es la enésima vez que este programa encuentra una dependencia declarada en el
borrador inicial del Roadmap sin respaldo verificable en el código o en el AR que supuestamente la
resolvió (mismo patrón que AR-023↔AR-025/048/049/050 y AR-043↔AR-030). **La dependencia queda resuelta
aquí mismo, en esta Fase 1, no por AR-001**: la respuesta a "archivar o reactivar" no depende de una
decisión de AR-001 — depende de la reserva normativa que ADR-021 ya fija directamente.

### Precisión sobre el conteo: dos grupos de "7 documentos" distintos, no el mismo

`FRAMEWORK_FREEZE_PREPARATION.md` (un documento del Framework, no de este programa) menciona una
pregunta abierta separada sobre **otros 7 documentos completamente distintos** — los 4 documentos
fundacionales de `docs/01-product/` más `north_star.md`/`canonical_dictionary.md`/
`UBIQUITOUS_LANGUAGE.md`, listados en el Apéndice de `THE_COMMITMENT_FRAMEWORK.md`. **Ese grupo no es
el alcance de AR-003** — son documentos de visión de producto, no de arquitectura de dominio, y su
"pregunta abierta" (archivar/mover/eliminar) es explícitamente competencia del propio Framework, no de
esta remediación arquitectónica. Se registra aquí solo para no confundir ambos conteos en fases
posteriores.

### Respuesta a la pregunta de framing

> **No, no son 7 documentos con tratamiento uniforme.** La evidencia muestra al menos 3 categorías
> reales: (a) 3 documentos de vocabulario pre-Framework sin ninguna opción normativa viva
> (`bounded_contexts.md`, y `domain_state_machines.md` salvo una sección puntual) — candidatos limpios
> a archivado; (b) `CONCEPTS.md`, el mismo caso que (a) pero con urgencia mayor por autodeclararse
> "Active"; (c) 3 documentos de persistencia con una reserva normativa viva en ADR-021 — candidatos al
> mismo tratamiento de "Preservación de opciones arquitectónicas" que AR-023 ya estableció, no a
> archivado sin matices; (d) 1 documento (`offline_sync_engine.md`) sin ninguna tensión, dependencia de
> una tecnología ya descartada por AR-001.

**Consecuencia para el alcance de AR-003:** el hallazgo original (7 documentos presentados como
vigentes sin serlo) se confirma vigente en su totalidad — cero ha cambiado desde la auditoría. Pero el
**tratamiento no puede ser uniforme** sin violar un principio que este mismo programa ya estableció
(AR-023). La dependencia declarada con AR-001 se descarta aquí, con evidencia, no se hereda sin
verificar.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**AR-003 tiene un perfil distinto al de las últimas remediaciones:** no se está corrigiendo
arquitectura ni introduciendo una capacidad — se está decidiendo cómo preservar conocimiento
arquitectónico histórico sin degradar la documentación viva.

**H1 (principal):** _"El problema no consiste en archivar documentación de dominio, sino en
reclasificar cada documento según el valor arquitectónico que todavía conserva, preservando
explícitamente aquellos fragmentos que siguen siendo evidencia válida o mantienen opciones
arquitectónicas aprobadas."_ Explica simultáneamente los tres hallazgos de Fase 1: la dependencia con
AR-001 carece de respaldo y no debe condicionar la decisión; ADR-021 mantiene abierta la opción de
Event Sourcing, por lo que ciertos documentos conservan valor prospectivo; `domain_state_machines.md`
ya fue usado por AR-047 como evidencia operativa, luego no puede tratarse como documentación
completamente obsoleta.

**Hipótesis alternativas descartadas:**

- **H2** — todos los documentos deben archivarse porque ya no representan el estado actual.
  Descartada: la propia evidencia demuestra que algunos fragmentos siguen siendo relevantes para
  decisiones arquitectónicas posteriores.
- **H3** — todos los documentos deben mantenerse activos. Descartada: confundiría documentación
  histórica con documentación normativa y reintroduciría ambigüedad en la arquitectura viva.
- **H4** — la decisión depende de AR-001. Descartada: la dependencia no tiene soporte documental real
  (verificado en Fase 1); no debería influir en el análisis.

**H1 sobrevive, con una precisión adicional:** _"La unidad de decisión deja de ser el documento
completo y pasa a ser el conocimiento arquitectónico que contiene."_ Uno de los hallazgos de Fase 1 ya
demuestra que un solo documento (`domain_state_machines.md`) puede contener tanto material archivable
como evidencia que debe preservarse — la misma estructura que AR-024 encontró al descubrir que la
unidad correcta no era "la ADR" sino "la decisión arquitectónica". Aquí la unidad correcta no es "el
documento" sino "el contenido con valor arquitectónico". Esto no implica todavía fragmentar los
documentos — esa es una cuestión de diseño para Fase 4A — pero redefine correctamente el problema para
Fase 2B.

**Expectativa registrada para Fase 2B, sin resolverla aquí:** D-003.1 no debería decir "archivar estos
documentos" ni "mantener estos documentos" — debería fijar que la documentación histórica de dominio se
clasifica según el valor arquitectónico vigente de la información que contiene, preservando
explícitamente tanto las evidencias reutilizadas por decisiones posteriores como las opciones
arquitectónicas que permanezcan abiertas por ADR vigente — dejando abierto si eso implica preservar un
documento entero, extraer secciones, crear anexos, mover contenido, o mantener referencias cruzadas
(todo eso pertenece a Fase 4A).

---

## Estado

**Fase 1 y Fase 2A cerradas.** El hallazgo se confirma vigente para los 7 documentos, sin ningún cambio
desde la auditoría. La dependencia declarada con AR-001 no tiene respaldo real y se resuelve
directamente en Fase 1 (la reserva normativa de ADR-021, no una decisión pendiente de AR-001). H1
sobrevive, refinada: la unidad de decisión es el conocimiento arquitectónico que cada documento
contiene, no el documento como bloque uniforme — mismo patrón que AR-024 estableció para las
decisiones arquitectónicas frente a las ADRs que las formalizan. Pendiente: **Fase 2B (Decisión)**.
Estado: se mantiene 🟦 En análisis. Decisión: se mantiene 💭 Pendiente de análisis (pendiente de que el
usuario congele D-003.1 en Fase 2B).
