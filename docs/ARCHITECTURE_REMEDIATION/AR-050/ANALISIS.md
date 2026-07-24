# AR-050 — AI Platform (Context Builder, Memory, Rulebook, Tool Calling)

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 38 AR pendientes)

Parseadas todas las filas `⬜ Pendiente` de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-047 (38 de
54; 15 cerradas, AR-052 en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por
(Impacto desc, Esfuerzo asc, Riesgo asc). **AR-050 es la única candidata con Impacto Muy Alto** entre
todas las pendientes con dependencias resueltas — gana el primer criterio sin necesidad de desempate.
Sus 4 dependencias declaradas (AR-001, AR-028, AR-030, AR-047) están las 4 cerradas; "Bloquea: Ninguna".
Owner=Ambos (decisión estratégica, no ejecución directa).

**Nota honesta sobre Esfuerzo:** XL es el esfuerzo más alto posible en la escala del programa. El
filtro programático no pondera el esfuerzo por encima del impacto — abrir Fase 1 (evidencia) tiene un
costo bajo independientemente del tamaño eventual de la implementación; el tamaño real de la AR se
evalúa en Fase 2A/4A, no aquí.

### Pregunta de framing que gobierna esta fase

> **¿Sigue el hallazgo original vigente en su totalidad, o el cierre de AR-047 (que esta misma AR
> declaraba como dependencia) resolvió parte de él?**

Se formula así porque AR-047 tocó exactamente uno de los 4 sub-hallazgos que la auditoría agrupó bajo
"AI Platform" — el enforcement del axioma "la IA propone, nunca ejecuta" — y dejó explícitamente
registrado que "AR-050 podrá reutilizar ese límite sin redefinir la arquitectura" (`AR-047/ANALISIS.md`,
Fase 4A). Hay que verificar si esa promesa se sostiene, no darla por buena.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-3-escalabilidad/13-ai-platform.md`, It.13):
agrupa 4 sub-hallazgos bajo "AI Platform":

1. **Cero integración de IA/LLM en todo el codebase.**
2. **La interfaz de Coach no es realmente "AI-ready"** — `RecommendationProvider.getRecommendations`
   es síncrona y pura; un proveedor real de LLM necesita una llamada de red asíncrona.
3. **"Context Builder" es 0%** — `DashboardContext` es un snapshot numérico, no el contenido real
   (descripciones, historial, intención expresada) de Goals/Commitments/Habits.
4. **"Memory" es 0%** — ninguna estructura de datos acumula entendimiento de la persona a través del
   tiempo.
5. **"Rulebook" (axioma "la IA propone, nunca ejecuta") sin enforcement estructural** — el mismo
   hallazgo que dio origen a AR-047.

**Verificado hoy, directamente en el código, sub-hallazgo por sub-hallazgo:**

1. **Cero integración de IA/LLM — confirmado, sin cambios.** `grep` exhaustivo (`openai`, `anthropic`,
   `langchain`, `ai-sdk`, `llamaindex`, `cohere`, `huggingface`, `vercel/ai`) en los 4 `package.json`
   (raíz, `apps/backend`, `apps/mobile`, `packages/domain`) → cero resultados. `env.config.ts` sin
   ninguna variable `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`/equivalente.
2. **Interfaz de Coach — confirmado, sin cambios.**
   `apps/mobile/src/features/dashboard/engine/recommendation/RecommendationProvider.ts` sigue
   definiendo `getRecommendations(context: DashboardContext): Recommendation[]` — síncrona, sin
   `Promise`, exactamente como describía la auditoría. `recommendationConfig.ts` conserva el
   placeholder comentado (`// VS-034: new AIRecommendationProvider(),`), todavía sin implementar.
3. **Context Builder — confirmado, sin cambios.** `packages/domain/src/dashboard/DashboardContext.ts`
   sigue siendo un conjunto de contadores (activos/completados, streak, un `priority task`) — cero
   contenido textual/histórico de dominio.
4. **Memory — confirmado, sin cambios.** Grep repo-wide (`UserProfile`, `preferenceProfile`,
   `patternSummary`, `behaviorProfile`, `longitudinal`, `userMemory`) → cero resultados en `apps`/
   `packages`.
5. **Rulebook/enforcement — parcialmente resuelto por AR-047, verificado, no asumido.**
   `packages/domain/src/ai-proposal/` (`AIProposal`, `AIProposalSource<TContext>`) existe y está
   probado (282/282 tests de dominio). La estructura confirma la promesa de AR-047: el contrato es
   genérico, no depende de ningún proveedor concreto, y su tipo de retorno solo puede ser
   `AIProposal[]`. **Pero el contrato no tiene todavía ningún consumidor** — ni Coach
   (`RecommendationProvider` sigue siendo la interfaz activa, sin relación con `AIProposalSource`) ni
   ningún módulo backend lo implementan. El axioma pasó de "sin ningún mecanismo de enforcement" a
   "con un mecanismo de enforcement disponible y probado, pendiente de ser adoptado por el primer
   consumidor real" — un cambio de estado real, no cosmético, pero no un cierre completo del
   sub-hallazgo: la promesa de AR-047 ("AR-050 podrá reutilizar este contrato sin redefinir la
   arquitectura") todavía no se ha ejercido, solo se ha verificado que existe.
6. **Adaptación (Chapter 2.7, dependencia mencionada en el veredicto de la auditoría) — confirmado,
   sin cambios.** `AdaptarCompromiso`/`EnAdaptacion` solo existen como fila de tabla en
   `docs/02-domain/domain_state_machines.md` (documento congelado) — cero implementación en código.
7. **Fortalezas de la auditoría, reverificadas, también sin cambios:** el Command layer sigue siendo
   "tool-calling-shaped" (comandos nombrados, validados, individuales); Coach sigue siendo
   determinista basado en reglas (confirmado también en AR-036/AR-047); los eventos de dominio reales
   (`TaskCompletedEvent`, `HabitCompletedEvent`, etc.) siguen existiendo sin cambios.

### Hallazgo adicional de esta verificación: dos conceptos de "propuesta" coexisten hoy sin relación

AR-047 introdujo `AIProposal` (dominio, genérico, cualquier capacidad de IA futura) mientras que
`Recommendation` (`packages/domain/src/dashboard/Recommendation.ts`, consumido por
`DashboardLayoutEngine`/Coach) ya existía y sigue siendo el tipo que la UI de mobile consume realmente
hoy. AR-047 verificó explícitamente que son conceptos distintos y los dejó sin fusionar, por diseño. Esa
decisión no se revisita aquí — pero **AR-050 hereda la pregunta de cómo relacionar ambos** (¿un futuro
`AIProposalSource` alimenta a `Recommendation` a través de algún adaptador, o Coach migra por completo a
`AIProposal`?) como parte genuina de su propio alcance, no como una pregunta ya resuelta.

### Respuesta a la pregunta de framing

> **El hallazgo original sigue vigente en 4 de sus 5 sub-hallazgos exactamente como se describió; el
> quinto (Rulebook/enforcement) cambió de estado real gracias a AR-047, pero no se cerró — pasó de
> "inexistente" a "existente, sin consumidor todavía."** Ningún sub-hallazgo se resolvió por completo;
> ninguno creció. La reducción de alcance es real pero parcial, y afecta solo a una quinta parte del
> hallazgo original.

**Consecuencia para el alcance de AR-050:** el núcleo del trabajo (integración real de IA/LLM,
refactor de la interfaz de Coach a async, Context Builder, Memory) permanece exactamente del tamaño que
describía la auditoría — **"una empresa materialmente mayor de lo que sugiere el propio framing del
Framework,"** en palabras de la propia auditoría. La única pieza que AR-050 puede dar por resuelta de
antemano es el mecanismo de enforcement propuesta/ejecución, ya construido y probado por AR-047 — no
necesita diseñarlo, solo adoptarlo.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**AR-050 es cualitativamente distinta al resto del programa hasta ahora:** en la mayoría de las ARs
previas, la investigación consistía en descubrir el alcance real de un hallazgo ya existente. Aquí, por
primera vez, las dependencias (AR-028, AR-030, AR-047) ya prepararon el terreno de antemano, y la
pregunta pasa a ser cómo introducir una capacidad nueva sin romper las propiedades arquitectónicas ya
consolidadas. Por eso el framing se trata con especial conservadurismo: **AR-050 no se trata como
"implementar IA"** — eso la convertiría en una épica de implementación en vez de seguir siendo una
remediación arquitectónica; el objetivo sigue siendo responder al hallazgo del audit, no construir una
plataforma completa por sí misma.

**Reencuadre del 5º sub-hallazgo (Fase 1):** el enforcement propuesta/ejecución ya no pertenece
realmente a AR-050 como problema de diseño — AR-047 cambió el estado del sistema; AR-050 **consume** esa
propiedad, ya no la diseña. Esto reduce el alcance efectivo de la AR a los 4 sub-hallazgos restantes,
más la pregunta nueva descubierta en Fase 1: la relación entre `Recommendation` y `AIProposal`.

**H1 (principal):** _"El problema arquitectónico consiste en introducir una plataforma de IA como una
nueva capacidad del sistema, reutilizando las propiedades ya establecidas (Identity, Proposal,
separación propuesta/ejecución), sin convertir la IA en un nuevo centro del dominio."_ Integra
naturalmente AR-030 (Identity), AR-047 (Proposal, separación propuesta/ejecución) y AR-028
(concurrencia/consistencia del estado que cualquier escritura de dominio debe respetar) — deja claro que
la IA llega a una arquitectura existente, no al revés.

**Hipótesis alternativas descartadas:**

- **H2** — el objetivo es integrar un proveedor LLM. Descartada: pertenece al diseño (Fase 4A), no a la
  decisión arquitectónica; hoy podría ser un proveedor, mañana otro, sin que eso cambie el problema que
  esta AR resuelve.
- **H3** — el objetivo es crear el nuevo Coach. Descartada: Coach es un consumidor: la plataforma de IA
  debe existir independientemente de él.
- **H4** — el objetivo es resolver `Recommendation` vs. `AIProposal`. Descartada: es un problema
  importante y real (el hallazgo más significativo de Fase 1, no anticipado por la auditoría original,
  y que nace precisamente porque AR-047 ya existe) — pero es una consecuencia del nuevo modelo, no el
  propósito principal de la AR.

**H1 sobrevive.** Resumen final: _"La plataforma de IA debe incorporarse como una capacidad
arquitectónica independiente que produzca propuestas reutilizando las propiedades establecidas por las
remediaciones previas, mientras define explícitamente la relación conceptual entre las recomendaciones
existentes y las nuevas propuestas generadas por IA."_ Deliberadamente sin mencionar proveedor, LLM,
MCP, prompts, embeddings, agentes ni RAG — ninguno de esos elementos define el problema arquitectónico.

**Pregunta registrada para Fase 4A, sin resolverla aquí:** con Esfuerzo XL, ¿existe una única decisión de
diseño capaz de materializar D-050.x, o la evidencia obliga a secuenciar la implementación en entregables
independientes dentro de la misma AR? No es una división de la AR (no se propone ahora, y con la
evidencia actual no se haría) — es una pregunta legítima de diseño que Fase 4A deberá responder: si la
implementación se ejecuta de una vez o mediante una secuencia controlada de incrementos, preservando una
única decisión arquitectónica.

---

## Fase 2B — Decisión

**Estado: ✅ Decisión aprobada.**

A partir de H1, se congela una decisión lo suficientemente estable como para sobrevivir a cambios de
proveedor, modelo o estrategia de IA.

**D-050.1:** _"La plataforma de IA constituye una capacidad arquitectónica independiente cuya única
responsabilidad es transformar contexto del dominio en propuestas estructuradas. Dichas propuestas
deberán integrarse con el modelo conceptual de recomendaciones del producto y solo podrán producir
efectos sobre el dominio a través de los límites de aplicación ya establecidos."_

Congela 5 propiedades arquitectónicas:

1. **Independencia de la capacidad.** La plataforma de IA no pertenece a Coach, Dashboard, Mobile ni
   Backend — todos ellos podrán ser consumidores; ninguno será su propietario.
2. **Entrada basada en contexto.** La IA consume contexto del dominio, no infraestructura. El origen
   del contexto (Context Builder, Memory, etc.) queda deliberadamente abierto para fases posteriores.
3. **Salida basada en propuestas.** La salida arquitectónica es siempre una propuesta estructurada —
   nunca comandos, nunca efectos laterales, nunca mutaciones del dominio. Reutiliza D-047.1 sin
   redefinirla.
4. **Relación explícita con `Recommendation`.** El punto nuevo que la auditoría no contemplaba y que la
   evidencia de Fase 1 sí reveló. No se congela todavía **cómo** se relacionan (si `Recommendation`
   desaparece, si implementa `AIProposal`, o si ambas convergen en un tercer concepto) — se congela que
   **la relación debe quedar explícitamente definida**, no implícita ni duplicada. Es una propiedad del
   modelo conceptual, no una decisión de diseño.
5. **Neutralidad tecnológica.** La decisión no menciona OpenAI, Anthropic, Gemini, Ollama, MCP, agentes,
   RAG ni embeddings — todo eso pertenece al diseño e implementación (Fase 4A). La arquitectura debe
   seguir siendo válida si cualquiera de ellos cambia.

**Deja deliberadamente abierto (pertenece a Fase 4A):** cuántos módulos existirán, dónde vivirá Context
Builder, cómo se implementará Memory, qué proveedor LLM utilizar, cómo se cachearán respuestas, si habrá
streaming, cómo se secuenciará una implementación XL.

**Consistencia con las AR previas, sin solapamiento:** AR-028 (la IA opera sobre un modelo de escritura
consistente), AR-030 (la identidad sigue siendo la referencia del usuario), AR-047 (la IA solo produce
propuestas, nunca ejecuta). AR-050 no sustituye ninguna de las tres — se apoya en todas.

**Criterio de validación para Fase 5** (registrado ahora, para responder cuando llegue):

1. ¿La plataforma de IA existe como capacidad independiente y no como parte de un consumidor concreto?
2. ¿Toda entrada a la IA está basada en contexto del dominio y no en dependencias de infraestructura
   específicas?
3. ¿Toda salida de la IA consiste en propuestas estructuradas?
4. ¿La relación conceptual entre `Recommendation` y `AIProposal` quedó definida de forma explícita?
5. ¿La plataforma puede cambiar de proveedor o modelo sin invalidar D-050.1?

---

## Estado

**Fase 1, Fase 2A y Fase 2B cerradas.** El hallazgo original se confirma vigente en 4 de sus 5
sub-hallazgos (integración IA/LLM, interfaz de Coach, Context Builder, Memory); el quinto (enforcement
propuesta/ejecución) ya lo resolvió AR-047 — AR-050 lo consume. H1 sobrevive. **D-050.1 aprobada:** la
plataforma de IA es una capacidad arquitectónica independiente que transforma contexto en propuestas
estructuradas, se integra explícitamente con el modelo de `Recommendation` ya existente, y solo produce
efectos sobre el dominio a través de los límites de aplicación ya establecidos — 5 propiedades
congeladas (independencia, entrada por contexto, salida por propuesta, relación explícita con
`Recommendation`, neutralidad tecnológica), atributos/módulos/proveedor/secuenciación deliberadamente
diferidos a Fase 4A. Mismo patrón que D-002.1/D-009.1/D-036.1/D-004.1/D-024.1/D-030.1/D-043.1/D-054.1/
D-044.1-3/D-047.1.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

**Objetivo concreto de esta fase:** diseñar la materialización de D-050.1 sin convertir AR-050 en una
implementación monolítica. Cambio importante respecto a toda AR anterior: aquí el diseño debe absorber
un Esfuerzo XL — la secuenciación deja de ser un detalle de gestión y pasa a ser una decisión de diseño
en sí misma.

### Alternativas evaluadas

- **A — Implementación monolítica** (plataforma + Context Builder + Memory + integración LLM +
  relación `Recommendation`↔`AIProposal` + primer consumidor, en una sola entrega). Descartada: no por
  ser arquitectónicamente incorrecta, sino porque dificulta la validación incremental — si algo falla,
  resulta difícil aislar si el problema pertenece al modelo, al contexto, a la memoria o al proveedor.
- **B — Diseñar primero la infraestructura** (Context Builder, Memory y proveedor antes de tener un
  consumidor). Descartada: repetiría el patrón de infraestructura anticipada que el programa ha evitado
  sistemáticamente (H-GOV-01) cuando no está respaldado por evidencia inmediata de un consumidor real.
- **C — Plataforma incremental alrededor del contrato (elegida).** La implementación se organiza
  alrededor de D-050.1, no alrededor de componentes técnicos — cada incremento introduce una capacidad
  reutilizable que preserva la decisión ya congelada.

### Secuencia de incrementos congelada (orden, no calendario)

1. **Modelo conceptual** — definir la relación explícita `Recommendation ↔ AIProposal`; resolver el
   modelo antes que la infraestructura.
2. **Contrato de plataforma** — materializar la capacidad arquitectónica independiente, manteniendo
   neutralidad respecto al proveedor.
3. **Contexto** — introducir el mecanismo que suministra contexto a la plataforma, sin asumir todavía
   memoria persistente.
4. **Primer consumidor** — adaptar Coach para consumir la plataforma mediante el contrato ya definido,
   reutilizando íntegramente D-047.1.
5. **Proveedor LLM** — incorporar el primer adaptador concreto, intercambiable desde el primer día.
6. **Memory** — añadir memoria solo cuando exista un flujo real que la necesite.

### Recommendation ↔ AIProposal — propiedad de diseño, no mecanismo

El punto más delicado de AR-050 no se resuelve por herencia ni reutilización prematura. Se congela
únicamente una propiedad: **"debe existir una transformación explícita entre ambos conceptos o una
unificación explícita; nunca una equivalencia implícita por coincidencia estructural."** Evita
duplicaciones silenciosas sin imponer todavía el mecanismo — ese mecanismo se decide en el Incremento 1.

### Neutralidad tecnológica — regla estricta para toda la implementación

> **La plataforma conoce capacidades; los adaptadores conocen proveedores.**

La plataforma no incorpora conceptos específicos de ningún proveedor (modelos, APIs, formatos, SDKs) —
esos pertenecen exclusivamente a los adaptadores (Incremento 5).

### Criterios de validación para Fase 5 (antes de pasar a Fase 4B)

1. ¿Puede implementarse por incrementos sin modificar D-050.1?
2. ¿Cada incremento añade una capacidad reutilizable y verificable?
3. ¿La relación `Recommendation ↔ AIProposal` queda resuelta en el modelo antes que en la
   infraestructura?
4. ¿El primer proveedor LLM puede sustituirse sin alterar la plataforma?
5. ¿El primer consumidor reutiliza íntegramente D-047.1 sin introducir un camino alternativo hacia el
   dominio?

### Observación registrada (no promovida)

AR-050 es la primera remediación donde la arquitectura ya no necesita descubrir el problema — AR-028,
AR-030 y AR-047 prepararon deliberadamente el terreno. El éxito de esta fase depende menos de elegir
tecnologías y más de mantener esa disciplina: introducir la plataforma de IA como una capacidad
arquitectónica independiente, donde cada incremento materialice una parte del diseño sin obligar a
reabrir D-050.1.

---

---

## Fase 4B — Implementación

### Incremento 1 — Modelo conceptual `Recommendation ↔ AIProposal`

**Estado: ✅ Cerrado.**

Regla estricta de este incremento: **todavía no construir plataforma.** El único objetivo es eliminar
la ambigüedad conceptual pendiente entre `Recommendation` (producto) y `AIProposal` (capacidad de IA).

**Alternativas evaluadas:**

- **A — `Recommendation` implementa `AIProposal`.** Descartada: acopla un concepto de producto ya
  existente a uno introducido por la plataforma de IA, y condiciona la evolución de `Recommendation` a
  decisiones futuras de la plataforma.
- **B — `AIProposal` implementa `Recommendation`.** Descartada: invertiría la dependencia — la
  plataforma terminaría conociendo un concepto específico del producto, contradiciendo D-050.1
  (neutralidad/independencia de la capacidad).
- **C — Transformación explícita (elegida).** Ambos conceptos permanecen independientes; la plataforma
  produce `AIProposal`, el producto consume `Recommendation`, y entre ambos existe una transformación
  explícita — no herencia, no coincidencia estructural, no reutilización implícita.

**Implementado — nuevo `packages/domain/src/ai-proposal-transformation/`:**

- `ai-proposal-to-recommendation.ts` — exporta únicamente el tipo
  `AIProposalToRecommendationTransformer = (proposal: AIProposal) => Recommendation`. Es la definición
  formal del punto de transformación: vive en un módulo propio, distinto de `ai-proposal/` y de
  `dashboard/`, precisamente para que ninguno de los dos tenga que importar al otro — este es el único
  módulo del dominio con permiso de importar ambos tipos.
- `index.ts` + export añadido a `packages/domain/src/index.ts`.
- **Deliberadamente no implementado todavía** (fuera del alcance de este incremento): prompts, contexto,
  LLM, memoria, consumidores nuevos, ni una función de transformación concreta enviada a producción —
  solo el contrato formal. Los tests ejercitan un transformador de ejemplo únicamente dentro del propio
  test, no como código de producción.

**Propiedades congeladas por este incremento:**

1. `AIProposal` pertenece exclusivamente a la plataforma — nunca al producto.
2. `Recommendation` pertenece exclusivamente al producto — nunca a la plataforma.
3. Ningún tipo conoce al otro — la dependencia directa desaparece.
4. La conversión constituye un límite arquitectónico propio (`AI Platform → AIProposal →
Transformation → Recommendation → UI/Coach`), que permite que ambos modelos evolucionen
   independientemente.

**Precisión honesta sobre el tipo de garantía (distinta de D-047.1):** a diferencia del límite
Authentication↔Identity (AR-030) o IA↔`CommandBus` (AR-047), que son estructuralmente imposibles de
romper por vivir en paquetes distintos sin la dependencia necesaria, `AIProposal` y `Recommendation`
viven en el **mismo paquete** (`packages/domain`) — no hay aislamiento de pnpm que lo haga físicamente
imposible. Hoy la separación es **verificada, no estructuralmente forzada**: `grep` confirma que
`ai-proposal/*.ts` no menciona `Recommendation`/`dashboard`, y que `dashboard/Recommendation.ts` no
menciona `AIProposal`/`ai-proposal`. Si en el futuro esta convención necesitara una garantía más fuerte
(p. ej. una regla de lint `no-restricted-imports`, como AR-054 hizo para `BullModule`), ese paso se
tomaría entonces, con evidencia de violación repetida — no ahora, sin ningún caso real que lo justifique
(mismo principio H-GOV-01 que ya gobierna el resto de esta AR).

**Validación del incremento (criterio fijado por el usuario):**

1. **¿`AIProposal` puede evolucionar sin modificar `Recommendation`?** Sí — ningún tipo referencia al
   otro; solo el transformador (que no existe todavía como implementación real) los conectaría.
2. **¿`Recommendation` puede cambiar sin alterar la plataforma IA?** Sí, misma razón.
3. **¿Existe un único punto de transformación entre ambos modelos?** Sí —
   `AIProposalToRecommendationTransformer`, en un módulo propio.
4. **¿No aparece ninguna dependencia circular?** Confirmado por grep — cero referencias cruzadas en
   ambas direcciones.
5. **¿El siguiente incremento (contrato de plataforma) puede comenzar sin volver a discutir este
   modelo?** Sí — el tipo del transformador ya fija la forma de la interacción; el Incremento 2 no
   necesita reabrir esta decisión.

**Evidencia de ejecución:** `pnpm --filter @commitment/domain test` → 283/283 passing (1 nuevo: el
transformador de ejemplo satisface el tipo, y `Recommendation` no hereda campos de `AIProposal` que no
le correspondan); `pnpm --filter @commitment/domain build` limpio; `pnpm --filter backend test`/`build`
→ 143/143, sin cambios (este incremento no toca backend, por diseño).

---

### Incremento 2 — Contrato de plataforma

**Estado: ✅ Cerrado.**

Regla estricta de este incremento: **la plataforma debe quedar completamente utilizable sin que exista
todavía un proveedor LLM.** El objetivo no es "hacer IA" — es construir la capacidad arquitectónica
independiente que después podrá usar cualquier proveedor.

**Hallazgo central del incremento, verificado antes de escribir código:** AR-047 ya construyó
exactamente el contrato que D-050.1 exige de la plataforma — `AIProposalSource<TContext>` (contexto
genérico como entrada, `AIProposal[]` como única salida posible, cero conocimiento de proveedor).
Escribir una segunda interfaz paralela habría sido una duplicación innecesaria, exactamente el tipo de
infraestructura anticipada que Fase 4A ya descartó (Alternativa B) para la AR completa. Se resuelve por
**reconocimiento explícito, no por reinvención** — el mismo patrón que AR-024/AR-030/AR-047 ya
establecieron y que quedó registrado como hipótesis en observación tras cerrar AR-047.

**Implementado — un único archivo nuevo, `packages/domain/src/ai-proposal/ai-platform.ts`:**

```ts
export type AIPlatform<TContext = unknown> = AIProposalSource<TContext>;
```

Un alias explícito, no una interfaz paralela: le da a la plataforma un nombre que coincide con el
vocabulario de D-050.1 ("la plataforma de IA"), searchable y documentado, sin duplicar el contrato que
AR-047 ya congeló. `TContext` permanece genérico por la misma razón que en `AIProposalSource` — este
incremento fija la frontera de la plataforma, no lo que contiene su contexto (eso es el Incremento 3).

**Deliberadamente fuera de alcance:** SDKs, clientes HTTP, prompts, modelos, API keys, streaming,
Context Builder concreto, Memory, Coach — nada de eso pertenece todavía a este incremento.

**Validación del incremento:**

1. **¿Existe una plataforma de IA identificable como capacidad independiente?** Sí — `AIPlatform`, en
   `packages/domain/src/ai-proposal/`, sin pertenecer a ningún consumidor.
2. **¿Su contrato devuelve únicamente `AIProposal`?** Sí — heredado sin cambios de `AIProposalSource`.
3. **¿La plataforma no conoce ningún proveedor concreto?** Confirmado por grep: cero menciones de
   `openai`/`anthropic`/`gemini`/`ollama`/`langchain`/`prompt`/`embedding`/`sdk`/`api.?key` en todo
   `ai-proposal/`.
4. **¿Los futuros adaptadores podrán implementarse sin modificar el contrato?** Sí, verificado con un
   test: una clase de ejemplo (`FutureAdapter`) implementa `AIPlatform<FutureConcreteContext>` con un
   contexto concreto inventado para la prueba, sin tocar `ai-platform.ts` ni `ai-proposal-source.ts`.
5. **¿El siguiente incremento (Contexto) podrá comenzar reutilizando íntegramente ese contrato?** Sí —
   el mismo test demuestra que un contexto concreto nuevo se conecta vía el parámetro genérico
   `TContext`, sin ningún cambio en la plataforma.

**Evidencia de ejecución:** `pnpm --filter @commitment/domain test` → 285/285 passing (2 nuevos:
`AIPlatform` es estructuralmente idéntico a `AIProposalSource` — asignación cruzada verificada en tiempo
de compilación —, y un adaptador futuro con contexto concreto satisface el contrato sin modificarlo);
`pnpm --filter @commitment/domain build` limpio; `pnpm --filter backend test`/`build` → 143/143, sin
cambios (este incremento tampoco toca backend, por diseño).

---

### Incremento 3 — Contexto

**Estado: ✅ Cerrado.**

**Primera decisión de modelado relevante desde el Incremento 1.** El objetivo no es "construir Context
Builder" — es definir qué representa el contexto para la plataforma. Se evita deliberadamente un
agregador que conozca hábitos, objetivos, identidad, historial, memoria o recomendaciones (eso
convertiría Context Builder en un nuevo centro del sistema).

**Implementado — nuevo `packages/domain/src/ai-proposal/ai-context.ts`:**

```ts
export type AIContext = object;
```

Deliberadamente mínimo — no fija cómo se obtiene, quién lo construye, de dónde viene, cuánto dura ni
cómo se cachea. Fija únicamente que el contexto es un concepto de dominio estructurado (un objeto), no
un DTO de infraestructura ni un valor primitivo suelto. Un proveedor no debería poder distinguir si un
contexto viene de base de datos, caché, agregación en memoria o un mock de test — solo recibe un valor
con forma de `AIContext`.

**`AIPlatform<TContext>` actualizado para acotar el genérico:**

```ts
export type AIPlatform<TContext extends AIContext = AIContext> = AIProposalSource<TContext>;
```

`AIProposalSource` (AR-047) **no se toca** — sigue exactamente como se congeló, con `TContext = unknown`
sin acotar. La restricción `extends AIContext` vive únicamente en `AIPlatform`, el vocabulario que
pertenece a AR-050 — mismo criterio ya aplicado en el Incremento 1 y 2 de no reabrir artefactos de ARs
cerradas salvo necesidad real.

**Validación del incremento:**

1. **¿La plataforma sigue sin conocer consumidores?** Sí — `AIContext` no menciona Coach, Dashboard,
   Mobile ni Backend.
2. **¿La plataforma sigue sin conocer proveedores?** Sí — cero mención de proveedor/modelo/SDK,
   verificado por grep.
3. **¿El contexto se convierte en un concepto del dominio de la plataforma, no en un DTO de
   infraestructura?** Sí — `AIContext` vive en `packages/domain/src/ai-proposal/`, no en ninguna capa
   de infraestructura; un test confirma que un contexto concreto inventado (`HabitCoachingContext`) lo
   satisface por estructura, y que un valor primitivo (`'not-a-context'`) es rechazado en tiempo de
   compilación (`@ts-expect-error`).
4. **¿El Incremento 4 (Coach) puede consumir exactamente ese contexto sin redefinirlo?** Sí — un
   segundo test (`JournalReflectionContext`) demuestra que un tipo de contexto completamente nuevo se
   conecta implementando `AIPlatform<TContext>` sin tocar `ai-context.ts` ni `ai-platform.ts`.
5. **¿Memory sigue completamente fuera del diseño?** Sí — `AIContext` no fija persistencia, duración ni
   caché; ningún campo ni comentario anticipa Memory.

**Evidencia de ejecución:** `pnpm --filter @commitment/domain test` → 287/287 passing (2 nuevos: un
contexto concreto satisface `AIContext` estructuralmente y un primitivo es rechazado en compilación; un
tipo de contexto nuevo implementa `AIPlatform` sin modificar la plataforma); `eslint` limpio (la forma
inicial, `interface AIContext {}`, disparó `@typescript-eslint/no-empty-object-type` — corregida a
`type AIContext = object`, exactamente lo que el propio mensaje de lint recomienda); `pnpm --filter
@commitment/domain build` limpio; `pnpm --filter backend test`/`build` → 143/143, sin cambios.

---

### Incremento 4 — Primer consumidor (Coach)

**Estado: ✅ Cerrado.**

Primer incremento con comportamiento observable — y por eso, deliberadamente conservador. El objetivo
no es "hacer inteligente al Coach": es demostrar que la plataforma puede ser consumida sin romper
D-047.1 ni D-050.1. A diferencia de los Incrementos 1-3 (que consolidaron modelo/contrato/contexto),
este consolida la **dirección de las dependencias**.

**Coach no se toca todavía en producción.** `CoachRecommendationProvider.ts`/`RecommendationProvider.ts`
(mobile) siguen exactamente igual — resolver su desajuste síncrono/asíncrono real es un refactor propio,
separado, que la auditoría original ya advirtió como coste a presupuestar cuando exista un proveedor
real (Incremento 5), no algo que deba resolverse solo para probar la conexión arquitectónica.

**Implementado — nuevo `packages/domain/src/ai-proposal-transformation/consume-ai-platform.ts`:**

```ts
export async function consumeAIPlatform<TContext extends AIContext>(
  platform: AIPlatform<TContext>,
  context: TContext,
  transform: AIProposalToRecommendationTransformer,
): Promise<readonly Recommendation[]> {
  const proposals = await platform.propose(context);
  return proposals.map(transform);
}
```

Es el único lugar donde un consumidor toca tanto la plataforma como `Recommendation` — fija la dirección
`Consumidor → AIPlatform → AIProposal[] → Transformation → Recommendation[]`, nunca la inversa. Un
consumidor real llamaría a esta función y solo vería `Recommendation`s de vuelta; nunca importa ni
inspecciona un `AIProposal` directamente.

**Demostrado en tests, no en producción:** se usa `DashboardContext` (dato de dominio real y ya
existente) como el `CoachContext` de ejemplo — sin inventar un tipo nuevo solo para la demostración.

**Validación del incremento:**

1. **¿Coach depende únicamente de `AIPlatform`?** Sí, demostrado — un `FakeCoachPlatform` de prueba
   implementa `AIPlatform<DashboardContext>`, y `consumeAIPlatform` es la única función que un
   consumidor real necesitaría llamar.
2. **¿Coach nunca conoce un proveedor?** Sí — cero mención de proveedor/modelo/SDK en
   `consume-ai-platform.ts`, verificado por grep.
3. **¿Coach sigue consumiendo `Recommendation`?** Sí — el tipo de retorno de `consumeAIPlatform` es
   `Recommendation[]`, nunca `AIProposal[]`.
4. **¿La transformación `AIProposal → Recommendation` ocurre exactamente una vez?** Sí, verificado con
   un test que cuenta las invocaciones del transformador contra una plataforma que devuelve 2
   propuestas — exactamente 2 llamadas, ni 0 ni más.
5. **¿La plataforma continúa siendo reutilizable por futuros consumidores?** Sí, verificado con un
   segundo consumidor de prueba (`JournalPlatform`, contexto `{ entryCount: number }` completamente
   distinto de `DashboardContext`) que reutiliza `consumeAIPlatform` sin ningún cambio — nada
   específico de Coach quedó filtrado en la función genérica.

**Evidencia de ejecución:** `pnpm --filter @commitment/domain test` → 290/290 passing (3 nuevos);
`eslint` limpio; `pnpm --filter @commitment/domain build` limpio; `pnpm --filter backend test`/`build`
→ 143/143, sin cambios (Coach real en mobile no se tocó).

---

## Estado

**Fase 1, Fase 2A, Fase 2B y Fase 4A cerradas. Fase 4B — Incrementos 1, 2, 3 y 4 de 6 cerrados.**
D-050.1 aprobada; diseño técnico congelado (Alternativa C, plataforma incremental). **Incrementos 1-3:**
modelo conceptual, contrato de plataforma y contexto, los tres pilares definidos antes del primer
consumidor. **Incremento 4:** `consumeAIPlatform<TContext>` fija la dirección de dependencias
(Consumidor → `AIPlatform` → `AIProposal[]` → Transformation → `Recommendation[]`), demostrado con un
consumidor de prueba tipo Coach (usando `DashboardContext` real) y verificado reutilizable con un
segundo consumidor completamente distinto — Coach real en mobile permanece sin tocar, por diseño.
290/290 tests de dominio, 143/143 backend sin cambios. Quedan 2 incrementos (proveedor LLM, Memory), que
ahora son adaptadores alrededor de una arquitectura ya cerrada, no elementos que la definan. Estado: se
mantiene 🟨 En implementación. Decisión: se mantiene ✅ Decisión aprobada. Pendiente: **Fase 4B —
Incremento 5 (proveedor LLM)**.
