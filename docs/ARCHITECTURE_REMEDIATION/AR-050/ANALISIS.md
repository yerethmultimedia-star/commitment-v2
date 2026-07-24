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
D-044.1-3/D-047.1. Pendiente: **Fase 4A (Diseño técnico)**. Estado: se mantiene 🟦 En análisis. Decisión:
💭 → ✅ Decisión aprobada.
