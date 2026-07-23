# AI Platform (Context Builder, Memory, Rulebook, Tool Calling)

## Current State

Zero AI/LLM integration exists anywhere in this codebase. Confirmed exhaustively, not assumed:

- No AI SDK dependency in any `package.json` (root, `apps/backend`, `apps/mobile`, `packages/domain`) — checked for `openai`, `anthropic`, `langchain`, `@ai-sdk/*`, `llamaindex`, `cohere`, `huggingface`, `vercel/ai`. Zero hits.
- `apps/backend/src/config/env.config.ts`'s Zod schema and `.env.example` have no AI-provider variable of any kind (no `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or equivalent).
- Repo-wide grep for `openai`, `anthropic.com`, `langchain`, `embeddings`, `vector.?db`, `pinecone`, `chromadb`, `qdrant` across all `.ts`/`.tsx` in `apps/` and `packages/`: zero hits.

What exists instead, and is real: `apps/mobile/src/app/(tabs)/coach.tsx` (a wired tab), backed by `CoachRecommendationProvider.ts` — a deterministic rules engine over `DashboardContext` (a thin, numeric snapshot: active/completed counts, streak days, one priority task). Its own header comment names a specific future ticket, VS-034, for an AI-backed provider. `recommendationConfig.ts` already has a commented-out placeholder line (`// VS-034: new AIRecommendationProvider(),`) reserving the intended integration point.

## Strengths

- **The Command layer is already naturally tool-calling-shaped.** Fase 1 (CQRS, Iteration 4) found commands are behavior-shaped (`ActivateCommitmentCommand`, `PauseCommitmentCommand`, etc.), individually named, and validated. This is structurally close to what an LLM function-calling/tool-use interface needs — discrete, named, schema-checked operations — even though nothing wires an LLM to them today. This is a genuine, if accidental, positive affordance.
- **Explainability (Framework Chapter 6) is already met without any AI**, confirmed independently in Iteration 9 (UX) — Coach's recommendation cards show evidence-based reasoning by default. This is real evidence that Chapter 6 constrains _reasoning visibility_, not _AI-ness_, exactly as the Framework claims.
- **Real domain events already exist for everything Coach's recommendations are based on** (`TaskCompletedEvent`, `HabitCompletedEvent`, `CommitmentActivatedEvent`, etc., per Iteration 1's DDD audit) — a future Context Builder would have real, well-modeled events to build from, not nothing.

## Weaknesses

- **The claimed AI-ready seam is not actually AI-ready — this is the most important finding of this iteration.** `RecommendationProvider.ts`'s own interface contract states: _"CONSTRAINT: implementations MUST NOT access Zustand, React Context, or any external I/O. They must be deterministic given the same input,"_ and `getRecommendations` is typed as a synchronous, pure function (`(context: DashboardContext) => Recommendation[]`, no `Promise`, no `async`). A real LLM-backed provider requires an asynchronous network call — it categorically cannot satisfy this interface as written. `CoachRecommendationProvider.ts`'s own comment ("the AI-backed provider... can be added to `recommendationConfig.ts` without the Coach screen changing") is aspirational, not accurate: the interface itself would need to change from sync-pure to async before an AI provider could be dropped in. This is the same shape of finding as Iteration 1's `AI_PROPOSAL` schema and Iteration 11's inert `offline`/`supportsOffline` flags — a comment describing future-readiness that the actual code contract contradicts.
- **"Context Builder" is effectively 0%, and the thinness of the one context object that exists is itself informative.** `DashboardContext` (`packages/domain/src/dashboard/DashboardContext.ts`) is a snapshot of counts and one task's title — not the user's actual Goal/Commitment/Habit _content_ (descriptions, history, stated intentions in their own words), which Framework Chapter 2.2 (Understanding) and Chapter 5 (Reasoning) would require. Building real "Understanding" needs substantially more than plugging a model into this object.
- **"Memory" is 0% by any definition.** Grepped for `UserProfile`, `preferenceProfile`, `patternSummary`, `behaviorProfile`, `longitudinal`, `userMemory` — zero hits anywhere in `apps`/`packages`. There is no data structure anywhere that accumulates understanding of a person across time beyond the raw Task/Habit/Commitment records already sitting in repositories (which Iteration 5 confirmed are in-memory and non-durable across restarts in any case).
- **"Rulebook" (the Chapter 5 axiom "The AI proposes; it does not enact") has zero structural enforcement — and the codebase already contains a counter-example pattern.** I checked whether the command-dispatch layer inherently guarantees only explicit user action can execute a command (which would mean the axiom is structurally free, regardless of AI). It does not: `RecurringCommitmentSaga`, `task-dependency-cascade.saga.ts`, and `cancel-tasks-on-commitment-completed.saga.ts` (all confirmed in Iteration 4/1) already have the system itself calling `this.commandBus.execute(...)` automatically in response to domain events, with no human in the loop for that specific action. This is legitimate and correct for those cases (cascading a cancellation, creating the next recurrence) — but it proves the architecture has no barrier preventing "system reacts to an event by executing a command automatically." If a future AI integration is implemented as an event listener that calls `commandBus.execute()` directly — instead of only ever returning a `Recommendation` for a human to accept through the UI — nothing in the current architecture would flag or prevent it. The axiom holds today purely by convention (the only AI-adjacent code, Coach, only ever returns data), not by any enforced boundary.

## Risks

- The gap between "the interface looks AI-ready" (comments) and "the interface is actually AI-ready" (sync, no-I/O contract) could cause real rework cost when VS-034 is eventually picked up, if the interface's current contract is trusted at face value instead of re-examined.
- Without any structural guardrail for "propose, don't enact," the risk of a future AI feature accidentally or incrementally crossing into auto-execution is a matter of code review discipline only, with no architectural fallback — the exact kind of risk Framework Chapter 5's axiom exists to prevent, currently unenforced by anything except convention.

## Technical Debt

- None accumulating yet in the traditional sense — there is no AI code to accrue debt in. The one piece of "debt" is documentary: `CoachRecommendationProvider.ts`'s comment about VS-034 readiness should be corrected or caveated now, while it's cheap, rather than discovered as false when VS-034 is actually attempted.

## Recommendations

1. When VS-034 is scheduled, budget for changing `RecommendationProvider`'s interface (sync → async) as part of that work, not as a surprise found mid-implementation — correct the aspirational comment now to say so explicitly.
2. If/when any AI-driven capability is designed, make the "propose, don't enact" boundary an explicit, checked architectural seam (e.g., an AI-sourced recommendation can only ever produce a `Recommendation` object routed through the existing UI-accept flow — never a direct `CommandBus` call) — write this down as a rule before writing the first line of AI integration code, given the Saga pattern already shows the codebase is otherwise comfortable with automatic command execution.
3. Treat "Context Builder" and "Memory" as genuinely new infrastructure work, not incremental extensions of `DashboardContext` — sizing this accurately now avoids underestimating the eventual AI effort.

## Priority

**Medium.** Nothing is broken and no debt is silently accumulating — this is a 0%-built, clearly-named future capability (VS-034), not a regression or an active risk today. It is not Low, however, because of the one concrete, fixable-now finding (the interface-contract mismatch and the unenforced "propose, don't enact" boundary) that will cost more to discover later than to correct in documentation now.

## Verdict on Framework Chapter 5's buildability

Chapter 5's six responsibilities (Understanding, Reasoning, Proposing, Explaining, Adapting, Learning) are a coherent, buildable target — nothing about them is architecturally incoherent given the domain's actual shape. But the chapter understates the amount of genuinely new infrastructure required: Explaining is already satisfied today (proven, not aspirational); Proposing/Reasoning have a good accidental foundation in the Command layer's tool-calling-shaped structure; but Understanding requires a Context Builder that doesn't exist over data that's currently far too thin (`DashboardContext`), Learning requires a Memory store that doesn't exist at all, and Adapting depends on Chapter 2.7's Adaptation flow, which Iteration 3 (Bounded Contexts) already found has no implementation. This is not "wire an LLM into existing seams" — it is "build a Context Builder and a Memory layer from scratch, then wire an LLM into them," a materially larger undertaking than the Framework's framing implies.
