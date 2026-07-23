# Bounded Contexts

## Current State

The shipped system has five real context candidates, verified directly against `packages/domain/src/*` and `apps/backend/src/app.module.ts`'s registered modules (`CommitmentModule, TaskModule, HabitModule, GoalModule, NotificationsModule, DevicesModule, MessagingModule` — no `IdentityModule`, no `InsightsModule`, no `CoachModule`):

```
┌───────────────────────────────────────────────────────────┐
│  Planning & Execution (Goal / Commitment / Task / Habit)   │
│                                                             │
│   Goal ──linkCommitment──> Commitment ──(commitmentId)──> Task
│    │                                                        │
│    ├──linkHabit──> Habit                                    │
│    │                                                        │
│    └────────────────(goalId, direct)─────────────────────> Task
│                                                             │
│  Ambiguous boundary — see Weaknesses #1                     │
└──────────────────────────┬──────────────────────────────────┘
                            │ Reminder.create(sourceId, sourceType)
                            │ sourceType: 'commitment'|'habit'|'task'
                            ▼
┌───────────────────────────────────────────────────────────┐
│  Notifications / Reminders                                  │
│  packages/domain/src/notifications/aggregate/reminder.ts     │
│  Genuinely source-agnostic — does not import or reference    │
│  Commitment/Task/Habit types at all.                         │
└──────────────────────────┬──────────────────────────────────┘
                            │ IntegrationMessage (Outbox)
                            ▼
┌───────────────────────────────────────────────────────────┐
│  Messaging (Open Host Service / integration boundary)        │
│  apps/backend/src/messaging/{application/ports,              │
│  infrastructure}/* — Outbox + Broker ports, versioned         │
│  envelope (correlationId/causationId/aggregateVersion)        │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  Identity                                                    │
│  packages/domain/src/identity/{aggregate,repositories,        │
│  events}/* — real aggregate, real repository interface,       │
│  real domain events. NO backend NestJS module registered.     │
│  Every other context takes `identityId` as a given, opaque     │
│  string — nothing server-side actually owns or validates it.  │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  Devices                                                      │
│  Small, real aggregate + real backend module                  │
│  (`/v1/devices/register`) — push-token registration.           │
└───────────────────────────────────────────────────────────┘

  Insights / Dashboard / Calendar / Appearance — NOT bounded
  contexts. No aggregate root, no domain events, no backend
  module, for any of the four. `InsightsContext.ts`'s own header
  comment: "Pure, framework-free snapshot consumed by the mobile
  Insights engine layer... never mutated after construction."
  These are client-computed read models over the Planning &
  Execution context's data, not independent contexts.
```

`docs/02-domain/bounded_contexts.md` (already flagged stale, Framework Appendix / `REVIEW_STATUS.md` priority 3) describes a materially different map — a Spanish-vocabulary domain with a "Social Context / Red de Apoyo" that was never built, and no Notifications/Messaging/Devices contexts at all in its terms. It has zero correspondence to the shipped system and should not be consulted for anything beyond historical record.

## Strengths

- **Notifications/Reminders is a textbook-clean generalized context.** `Reminder` (`packages/domain/src/notifications/aggregate/reminder.ts`) takes `sourceId: string` and `sourceType: 'commitment'|'habit'|'task'` — it has zero import of, or reference to, Commitment/Task/Habit's actual types. This is a real Customer/Supplier relationship done correctly: the upstream contexts supply an opaque id + type tag, and Reminder never reaches back into their internals. Good sign that at least one integration boundary here was deliberately designed, not organically leaked.
- **Messaging implements a legitimate Open Host Service / Outbox pattern**, not just a stub: `apps/backend/src/messaging/application/ports/{outbox.repository.port.ts, message-broker.port.ts}` plus a real `OutboxPublisherService` and `IntegrationMessage` envelope with `correlationId`/`causationId`/`aggregateVersion`. This is meaningfully more sophisticated than the project's current external-integration needs require today (nothing external consumes it yet) — evidence of forward-looking design rather than accidental complexity, since it directly serves this project's own Law 0 ("technology is never the product," build for what survives replacement).
- **Insights/Dashboard/Calendar/Appearance were correctly NOT modeled as heavyweight DDD contexts.** They're plain read-model interfaces and client-side engines. Given they have no independent invariants or lifecycle of their own — they only ever reflect state owned by Planning & Execution — modeling them as full bounded contexts with their own aggregates would have been premature ceremony. This is right-sized restraint, not an oversight.

## Weaknesses

- **The Planning & Execution "context" has an unresolved internal boundary question.** `Goal.ts`'s own header comment states the hierarchy "Goal -> Commitment -> Task/Habit" as if it were a settled, layered relationship. But `Task` has both `commitmentId: CommitmentId | null` AND `goalId: string | null` — a Task can attach to a Goal directly, with no Commitment in between (confirmed in `docs/PROJECT_AUDIT.md` §2 and `fase-1-nucleo/01-ddd.md`). Strategically, this means the code has never actually decided whether Goal/Commitment/Task/Habit is **one** bounded context (a shared kernel, in which case the direct Task→Goal link is a normal internal relationship and the "hierarchy" comment is just aspirational/wrong) or **layered sub-contexts** with Commitment as a required intermediary (in which case Task's direct Goal link is a boundary violation that undermines the whole point of having Commitment as a layer). Both readings are defensible from the code; neither has been chosen.
- **Identity is a domain-complete, integration-incomplete context.** It has a real aggregate, value objects (`preferred-time-zone.ts`, `display-name.ts`, `preferred-language.ts`), events, and a repository interface — genuine tactical DDD work exists. But there is no `IdentityModule` anywhere in `app.module.ts`. Every other context (Commitment, Goal, Task, Habit, Reminder) takes `identityId` as an opaque, unvalidated string. The context exists as a concept but has no enforcement boundary in the running system.

## Risks

- **Boundary ambiguity compounds.** Every new feature that needs to relate to "the thing the user is working on" will face the same unresolved question Task already answered ad hoc (link directly to Goal). Without an explicit decision, each future aggregate is free to independently choose, and the model will drift into an inconsistent "big ball of mud wearing DDD's clothes" — aggregates and value objects done well individually, but no coherent shared understanding of where one context's authority ends and another's begins.
- **No real identity enforcement is a structural blocker for anything Chapter 5 of the Framework describes as AI "Learning"** — accumulating understanding of a specific person over their whole history requires that "person" to be a real, integrated, server-validated concept, not an opaque string every other module trusts implicitly. This isn't urgent while the product is single-user/demo-scale, but it is squarely in the path of any real Coach/AI work.
- **Insights/Dashboard being purely client-computed is a correctness risk the moment there is more than one client per account** (e.g., a future second device) — two clients would independently compute "the same" insight and could disagree, since there's no server-side single source of truth for these read models today. Not a problem yet (in-memory, single-session, demo-scale per `docs/PROJECT_AUDIT.md` §4), but worth naming now rather than discovering it later.

## Technical Debt

- Task's direct `goalId` link contradicts `Goal.ts`'s own documented hierarchy comment — already flagged as a DDD-tactical inconsistency in Iteration 1; this iteration reframes the same fact as an unresolved **strategic** boundary decision, which is the more consequential framing since it affects how every future feature should be designed, not just how this one field should be read.
- `docs/02-domain/bounded_contexts.md` remains unarchived and would actively mislead anyone who reads it expecting it to describe the current context map (already tracked as Freeze Preparation priority 3 in `docs/00-framework/REVIEW_STATUS.md` — not new, just reconfirmed from this angle).

## Recommendations

1. **Make an explicit, written decision on the Goal/Commitment/Task/Habit boundary** — following this project's own established pattern (an ADR, per `docs/03-architecture/`): either (a) declare Planning & Execution one bounded context / shared kernel, document that Task's direct Goal link is intentional and permanent, and drop the "strict hierarchy" language from `Goal.ts`'s comment since it's misleading; or (b) decide Commitment is a mandatory intermediary and constrain Task's `goalId` to require a Commitment in between. Either answer is legitimate — leaving it undecided is the only wrong option, because it invites inconsistent choices in every future feature. **Why:** this directly serves Maintainability and Developer Experience — the next engineer who adds a cross-aggregate link has no rule to follow today.
2. **Treat Identity's missing backend module as a prerequisite for any real Coach/AI work**, not an independent backlog item — sequence it before Iteration 13 (AI Platform) findings get acted on. **Why:** Reliability and Product Quality — an AI system that's supposed to learn about "this person" needs a real, enforced person concept to learn about.
3. **Flag (don't yet build) server-side Insights computation as a scaling trigger**, activated specifically by multi-device support, not by user count alone. **Why:** avoids premature investment (Maintainability/DX cost now) while naming the actual condition that would make today's client-side approach wrong (Reliability later).

## Priority

**Medium.** Nothing here is broken in the currently-shipped, single-user, in-memory system — every context that exists and is wired works correctly, and two of the five context boundaries (Notifications, Messaging) are genuinely well-designed. But the Goal/Commitment/Task boundary is a foundational, unresolved strategic question that gets strictly more expensive to answer the more feature work is built on top of the ambiguity — the same category of "not urgent today, compounding tomorrow" finding as Iterations 1 and 2.
