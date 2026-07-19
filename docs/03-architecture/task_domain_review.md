# Task Domain Review — Estimated Duration & Due Date

**Status:** Proposal / analysis, not an ADR — no domain decision is made or implemented here. **Adopted 2026-07-19** as the basis for Epic "Task Capability Completion" (see `ENGINEERING_BOARD.md` v1.48.0, `PROJECT_STATUS.md` v1.69.0) and the "Domain Exposure Verification" working principle registered the same day in `ENGINEERING_BOARD.md`.
**Context:** Requested after the Task List UX rounds, before starting Fase 2.6 (Form System). Scope per the request: confirm `dueDate` and `estimatedDuration` belong in Task's core model, explain how they enable Calendar/Reminder Engine/Coach/Progress/Analytics, propose an updated model. Explicitly no AI logic, no auto-planning, no implementation this round.

## Headline finding

**The model you're asking for mostly already exists.** `estimatedMinutes`, `actualMinutes`, `dueDate`, and `startDate` are all real, first-class fields on the `Task` aggregate (`packages/domain/src/task/aggregate/Task.ts`), with working behavior methods (`estimate()`, `schedule()`) and their own domain events (`TaskEditedEvent`, `TaskDueDateChangedEvent`). This isn't a domain design gap — it's an **exposure** gap, split across three different layers, each with a different size of fix. Below is the verified state of every field, layer by layer, not a re-proposal of things that already exist.

## Field-by-field, verified against the actual code

| Field                                                     | Domain (`Task.ts`)                                                                                              | Backend command                                                    | Backend read (`TaskView`) | Mobile `TaskModel`                                            | Mobile UI                                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `estimatedMinutes`                                        | ✅ prop + `estimate()`                                                                                          | ✅ `RegisterTaskCommand` (create) **and** `EditTaskCommand` (edit) | ✅                        | ✅                                                            | ❌ no input anywhere (Detail shows it read-only; TaskForm has no field, create or edit) |
| `actualMinutes`                                           | ✅ prop + `estimate()`                                                                                          | ✅ same two commands                                               | ✅                        | ✅                                                            | ❌ same as above                                                                        |
| `dueDate`                                                 | ✅ prop + `schedule()`                                                                                          | ✅ `RegisterTaskCommand` (create only)                             | ✅                        | ✅                                                            | ✅ create-time picker (this session); ⚠️ read-only after creation                       |
| `startDate`                                               | ✅ prop + `schedule()`                                                                                          | ❌ not on any command                                              | ✅                        | ❌ not mapped                                                 | ❌                                                                                      |
| `schedule()` (change `dueDate`/`startDate` post-creation) | ✅ method + `TaskDueDateChangedEvent` exists                                                                    | ❌ **no command or endpoint calls it — unreachable from HTTP**     | —                         | —                                                             | —                                                                                       |
| `tags`                                                    | ✅ prop                                                                                                         | ✅ both commands                                                   | ✅                        | ❌ not mapped                                                 | ❌                                                                                      |
| `metadata`                                                | ✅ prop                                                                                                         | ✅ both commands                                                   | ✅                        | ❌ not mapped                                                 | ❌                                                                                      |
| `reminder`                                                | N/A — modeled as a **separate** `Reminder` aggregate (`packages/domain/src/notifications`), not a field on Task | Habit/Commitment only (`ReminderSourceType`)                       | —                         | Client-side-only store (`core/reminders/`, built this sprint) | ✅ full UI, not yet backend-connected for Task                                          |

Rows with a ❌ in "Backend command" or "Mobile UI" are genuine gaps. Everything else already works end to end and was simply never surfaced.

## Two things this review corrects from earlier in this sprint

1. When I built the Reminders UI foundation, I concluded "`dueDate` can only be set at creation" and made the Detail/Edit screens show it read-only after that, with a hint saying so. That was **true of the exposed API**, but not true of the domain — `Task.schedule()` already exists and already fires `TaskDueDateChangedEvent`. The actual gap is one missing backend command (`ScheduleTaskCommand` + a `PATCH tasks/:id/schedule`-style endpoint calling `task.schedule()`), not a domain limitation. Fixing that read-only restriction later is a backend-only change — zero domain risk.
2. `actualMinutes` isn't a new concept to add "for the Coach to learn from later" — it's already collected on every `complete()` call (`Task.complete(actualMinutes?)`) and **already consumed** by Insights: `daily-metrics.ts`'s `focusMinutes` is `completedTasksThatDay.reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0)`. The estimated-vs-actual variance the Coach could eventually learn from is a comparison between a field that's fully wired (`actualMinutes`) and one that's fully modeled but not yet summed anywhere (`estimatedMinutes`) — the second half of the "comprometido vs completado" idea, not a new field.

## How each field already enables (or is one step from enabling) each pillar

**Calendar.** ~~`useDayAgenda.ts` already threads `estimatedMinutes` into every task's agenda item — rendered nowhere.~~ **Correction (2026-07-19, during Task Capability Completion Story 2):** this was wrong — checked `useDayAgenda.ts`'s data-carrying but not `calendar.tsx`'s actual render output closely enough. `calendar.tsx` already renders `AgendaItem.durationMinutes` as a compact text label next to each item, in code that predates this whole sprint (commit `a0e865d`). Live-verified working. The "2:15 PM → 3:00 PM" proportional visual block-sizing idea is real and still not built — but it's a different UI paradigm (an hour-by-hour grid), not a rendering gap in the current flat-list `calendar.tsx`. Split out as its own future epic, **Calendar 2.0 / Time Blocking** (see `ROADMAP.md`), not part of Task Capability Completion.

**Progress / Analytics.** Half-built already, per the `focusMinutes` finding above. "Tiempo comprometido vs tiempo completado" is: sum `estimatedMinutes` across the same task set `daily-metrics.ts` already iterates (mirroring the `actualMinutes` reduce it already does), pair it with the existing `focusMinutes`. No new field, no new query.

**AI Coach.** Needs `estimatedMinutes` summed per day (see above) to answer "your tasks today add up to 2h20m." The estimated-vs-actual variance ("usually underestimate this kind of task by 25%") needs both fields on completed tasks, which — again — the domain already records on every `complete()` call. What's missing is a Coach-side aggregation reading data that already exists, not a domain change.

**Reminder Engine.** Already documented in `docs/03-architecture/reminder_engine_extension.md` from earlier this sprint: `Reminder` is its own aggregate keyed by `(sourceId, sourceType)`, currently `'habit' | 'commitment'`. The mobile-side `core/reminders/` module built this sprint already assumes this shape (`ReminderEntityKind`, not a field embedded in each entity type) — so the proposed `reminder?: ReminderSettings` field on Task in your sketch is better modeled as "Task becomes a third `ReminderSourceType`," matching the pattern that already exists, rather than a field on the aggregate itself. I'd correct that one part of the proposed model rather than carry it forward as written.

## Proposed model (what's real vs. what's genuinely new)

```typescript
// Already true today — packages/domain/src/task/aggregate/Task.ts
interface TaskProps {
  id;
  title;
  description;
  status;
  priority;
  estimatedMinutes: number; // "estimatedDuration" — already exists, this is the name
  actualMinutes: number; // "actualDuration" — already exists, already collected on complete()
  dueDate: Date | null; // already core, already has a change method (schedule())
  startDate: Date | null; // already core, same change method, not yet mapped to mobile
  commitmentId;
  goalId;
  tags;
  metadata;
  createdAt;
  updatedAt;
}
// Reminder: NOT a field — a separate Reminder aggregate referencing
// (sourceId: task.id, sourceType: 'task'), once 'task' is added to
// ReminderSourceType. Matches Habit/Commitment's existing pattern exactly.
```

Genuinely new, no domain presence anywhere today:

```typescript
energyLevel?: 'low' | 'medium' | 'high'  // real domain addition if pursued
location?: string                          // real domain addition if pursued
```

I'd treat these two differently from everything above — they're actual new domain surface, not exposure gaps, so they're the one part of your sketch that would need a real domain-change discussion (new value objects, new events, migration considerations) if prioritized. Not proposing that now — flagging that it's a different category of work from the rest of this list.

## What I'm explicitly not doing this round

No domain changes, no new backend commands, no new mobile UI — matching "no implementar todavía." This document is the model confirmation and gap map you asked for.

## Recommended next steps (separately authorizable, ordered by size)

1. **Mobile-only, zero backend/domain risk:** add an `estimatedMinutes` input to `TaskForm` (create and edit) and add it to `CreateTaskPayload`/the edit payload type — the backend already accepts it on both commands today.
2. **Mobile-only:** map `startDate`, `tags`, `metadata` into `TaskModel` — the backend already returns them.
3. **Mobile-only:** render `estimatedMinutes` as calendar block duration in the day agenda — the data is already there.
4. **Mobile-only:** sum `estimatedMinutes` alongside the existing `actualMinutes`/`focusMinutes` computation in `daily-metrics.ts`, surfaced as "comprometido vs completado" in Progress.
5. **Backend-only, no domain change:** add a `ScheduleTaskCommand` + endpoint wrapping the existing `Task.schedule()`, to make due date genuinely editable after creation (removes the "solo puede definirse al crear la tarea" restriction the Reminders round's UI currently enforces).
6. **Domain change, if pursued:** `energyLevel`/`location` as new Task fields — the one item on this list that's a real domain-change conversation, not just exposing what's already there.

Items 1-5 don't touch `packages/domain` at all. Item 6 is the only one that would.
