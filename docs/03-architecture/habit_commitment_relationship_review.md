# Habit↔Commitment Relationship — Domain Review (ADR-023 groundwork)

**Status:** Domain Exposure Verification for candidate ADR-023. Not an ADR — no decision is made
here. Scoped explicitly by the user as the successor to ADR-022 (Task Lifecycle & Execution Model),
which formalized Task↔Commitment: relationship shape, invariants, cascades, Command Preconditions.
ADR-023 must answer the same categories of question for Habit↔Commitment.

**Explicit constraint from the user:** do not propose a Habit state-machine expansion
(`Draft/Ready/Started/Paused/Completed/Cancelled/Archived`) — there is no evidence today that Habit's
current `Active | Disabled | Archived` model plus its separate `complete()`/`uncomplete()` occurrence
tracking is insufficient. This review does not touch that question; it stays on the relationship.

## The headline finding

**There is no Habit↔Commitment relationship today — not partial, not indirect, not implicit. It does
not exist in the domain, the API, the UI, analytics, Calendar, or the Reminder Engine.** This changes
what ADR-023 actually is. ADR-022 formalized the _edge cases_ of a relationship that already existed
in code (`Task.commitmentId` was already there; the cascade on `CommitmentCompletedEvent` was already
there). ADR-023 starts one level earlier: it must first decide **whether to introduce the
relationship at all**, and only then define its shape.

The one piece of evidence that a relationship was _intended_, not merely unconsidered: ADR-022 itself
deferred it explicitly (§12) and left a comment trail — see finding 2 below.

## Findings, by question

### 1. Relationship shape

No `commitmentId` field exists anywhere in `packages/domain/src/habit/` — not on the aggregate, not
in any event payload, not in the read model. `HabitForm.tsx` has no equivalent of `TaskForm`'s
Ninguno/Objetivo/Compromiso relation selector — Habit's only relational field is `goalId: string |
null` (`habit.ts:36`) with its own `relinkGoal()` method (`habit.ts:233-243`). A Habit can link
directly to a Goal today. It cannot link to a Commitment, singular or multiple, through any layer.

### 2. Invariants — the decisive piece of evidence

`apps/backend/src/task/application/preconditions/commitment-activation.preconditions.ts` implements
Commitment's activation precondition (ADR-022 §3.1's "≥1 Task or Habit" rule) under the name
`TaskBasedCommitmentActivationPreconditions`. Its own doc comment: _"Only evaluates the 'Task' half
of the original '≥1 Task or Habit' requirement — Habit has no relationship to Commitment yet
(deferred to candidate 'ADR-023', not blocking)."_ `hasExecutionPlan()` queries
`taskRepository.findByCommitmentId()` only. **In practice today, a Commitment's activation invariant
is "≥1 non-cancelled Task" — the "or Habit" is design intent recorded in a comment, not implemented
logic.** ADR-022 §12 documents this as a known, accepted, non-blocking gap at the time.

### 3. Cascades

None exist, because none _can_ — with no `commitmentId` on Habit, there's no way to look up which
Habits would need to react to a Commitment state change. Commitment's lifecycle events
(`CommitmentPausedEvent`/`CommitmentCompletedEvent`/`CommitmentCancelledEvent`) are consumed today by
exactly two things: Task's own cascade (ADR-022, out of this scope) and the Reminder Engine's
suspend/cancel handlers acting on the _Commitment's own_ reminder — neither touches Habit.

### 4. Command Preconditions

None reference both aggregates. `Habit.complete()`/`enable()`/`disable()`/`edit()` each have exactly
one guard — `ensureNotArchived()` — with zero Commitment awareness anywhere in the aggregate or its
command handlers.

### 5. Reminder Engine

Already a 3-way generic `ReminderSourceType = 'commitment' | 'habit' | 'task'`. Habit's own reminder
scheduling service reads only its own recurrence/reminderTime/anchorDate — zero Commitment awareness.
A Habit's reminders fire on the same schedule regardless of any (currently nonexistent) linked
Commitment's state.

### 6. Analytics

Insights computes `activeCommitments`/`completedCommitments` per-Goal, and
`habitsOnTrack`/`habitsAtRisk` from Habit's own streak/completion state and `habit.goalId` — two
entirely separate computations with no cross-reference, because there's nothing to cross-reference.

### 7. Calendar

`build-day-agenda.ts`'s Habit branch checks only `habit.enabled` and recurrence due-ness. No
Commitment lookup anywhere in that path.

## What this means for ADR-023

This is not "define the rules for an existing-but-underspecified relationship." It's "decide whether
Commitment should be able to own Habits the way it owns Tasks, and if so, define the same category of
rules ADR-022 defined for Task: relationship shape (optional/required, 1:1/1:many), invariants,
cascades, and Command Preconditions." That first decision — introduce the relationship or not — is a
real product/architecture call, not something this review makes. Options visible from the evidence
alone (not a recommendation, just the shape of the decision):

- **Introduce it**, mirroring Task: add `commitmentId: string | null` to `Habit`, extend
  `TaskBasedCommitmentActivationPreconditions` to actually check Habits too (closing the stale
  comment), define cascades (does a Habit pause when its Commitment pauses? stay independent?),
  extend the Reminder/Calendar/Analytics paths accordingly.
- **Formally decide against it** — Habit's relationship to Goal (already real, already working) may
  already be the intended organizing structure, with Commitment deliberately Task-only. In this case
  ADR-023's job is to make that explicit and retire the stale "≥1 Task or Habit" comment/intent from
  ADR-022, rather than leave it as an open deferred item indefinitely.
- **Something narrower** — e.g. a read-only/display-only association (a Habit can be shown under a
  Commitment's own view without a real domain link) — a middle ground neither this review nor ADR-022
  anticipated, worth naming as a real option rather than assuming binary.

Awaiting direction before writing ADR-023 itself.
