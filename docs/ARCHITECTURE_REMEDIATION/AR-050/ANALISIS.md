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

## Estado

**Fase 1 cerrada.** El hallazgo original se confirma vigente en 4 de sus 5 sub-hallazgos (integración
IA/LLM, interfaz de Coach, Context Builder, Memory), sin ningún cambio desde la auditoría. El quinto
(enforcement del axioma propuesta/ejecución) fue parcialmente resuelto por AR-047 — el mecanismo existe
y está probado, pero AR-050 será su primer consumidor real. Pendiente: **Fase 2A (Hipótesis)** — dada
la magnitud (Impacto Muy Alto, Esfuerzo XL, Owner=Ambos), la decisión de cómo secuenciar/acotar esta AR
requiere el juicio estratégico del usuario, no ejecución directa. Estado: ⬜ → 🟦 En análisis. Decisión:
💭 Pendiente de análisis.
