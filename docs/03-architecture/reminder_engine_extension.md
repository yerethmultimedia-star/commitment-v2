# Reminder Engine — Current State & Extension Path

**Status:** Informational / design reference (not an ADR — no domain decision is made here).
**Context:** Stabilization Sprint, UX Refinement Round 2. Produced while building the Task Reminders UI foundation (§5 of that round's brief) and the "generic ReminderService/NotificationService" the round's closing recommendation asked for.

## The headline finding

**A real, generic reminder engine already exists on the backend.** It is not a proposal — it's shipped, hexagonal-architecture code, currently wired up for Habit (and partially Commitment) only. The round's brief asked for a design for a future "Notification & Reminder Engine reusable by all entities." That engine is not future work; it's `apps/backend/src/notifications/`. What's missing is Task/Goal/Coach _participation_ in it, not the engine itself. Any future work in this area should extend this module, not build a parallel one.

## What exists today

```
apps/backend/src/notifications/
├── application/
│   ├── ports/
│   │   ├── reminder.repository.port.ts        — save/findBySourceId/findById/findReady
│   │   ├── reminder-scheduler.port.ts          — schedule/suspend/reschedule/cancel
│   │   ├── reminder-execution-engine.port.ts   — enqueue/cancel
│   │   └── notification-provider.port.ts       — send(NotificationMessage)
│   ├── services/
│   │   ├── habit-reminder-scheduling.service.ts   — Habit-specific: recurrence → next scheduledFor
│   │   ├── habit-reminder-rollover.service.ts
│   │   ├── reminder-dispatcher.service.ts         — @Cron, promotes "ready" reminders to the outbox
│   │   └── reminder-worker.service.ts
│   ├── handlers/  — one per Habit lifecycle event:
│   │   schedule-reminder-on-habit-registered, schedule-reminder-on-activation,
│   │   reschedule-reminder-on-habit-occurrence, reschedule-reminder-on-habit-postponed,
│   │   resume-reminder-on-habit-enabled, suspend-reminder-on-habit-disabled,
│   │   suspend-reminder-on-pause, cancel-reminder-on-habit-archived,
│   │   cancel-reminder-on-terminal-state, schedule-reminder-on-queued
│   └── mappers/reminder-queued-message.mapper.ts
└── infrastructure/
    ├── expo-notification-provider.ts / console-notification-provider.ts
    ├── in-memory-reminder.repository.ts
    ├── in-memory-notification-device-projection.repository.ts
    └── reminder.processor.ts

packages/domain/src/notifications/aggregate/
├── reminder.ts             — Reminder aggregate: sourceId, sourceType, scheduledFor,
│                              status (Scheduled/Queued/Processing/Suspended/Cancelled/
│                              Completed/Failed), attempts, provider, error tracking
└── reminder-source-type.ts — ReminderSourceType = 'commitment' | 'habit'
```

**Design already generic:** `Reminder` doesn't know what a Habit or Commitment is. It only knows `(sourceId, sourceType, identityId, scheduledFor)` plus delivery bookkeeping. `ReminderSchedulerPort.schedule()` already accepts `seriesId`/`recurrencePattern` parameters that Habit's own scheduling service doesn't even use yet (it recomputes and reschedules one occurrence at a time instead) — those parameters are sitting there for exactly this kind of extension.

**One Reminder = one scheduled fire.** Recurrence isn't modeled inside the `Reminder` aggregate — it's computed _upstream_, per source type, by a dedicated scheduling service (`HabitReminderSchedulingService.scheduleNext()`) that reads the source's own recurrence rule and calls `scheduler.schedule(sourceId, sourceType, identityId, nextDate)` again each time the source's state changes. This is the pattern any new source type follows.

**Delivery is provider-agnostic.** `NotificationProvider.send(NotificationMessage)` takes `{ identityId, pushToken, title, body, metadata: Record<string,string> }`. The `metadata` bag is already free-form — this is the seam for notification actions (see below), no port change needed.

## What the mobile Reminders UI foundation was built to match

`apps/mobile/src/core/reminders/reminder.types.ts` (new, this round) defines `ReminderSettings { enabled, preset, customDateTime, repeat, stopCondition }` — deliberately shaped to translate 1:1 onto the backend primitives above:

| Mobile UI field                                                               | Backend concept it maps to                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preset` (atDueDate / 5min / 15min / .../ custom) + the entity's own due date | The `scheduledFor` a `TaskReminderSchedulingService.scheduleNext()` would compute, same as Habit's does from recurrence + reminderTime                                                                                          |
| `repeat` (never / 15min / hourly / daily)                                     | `ReminderSchedulerPort.schedule()`'s existing `recurrencePattern` parameter — currently unused by Habit, would be Task's first real consumer, OR implemented the same way Habit does it (recompute-and-reschedule on each fire) |
| `stopCondition` (onCompleted / afterDueDate)                                  | Which lifecycle event handler calls `scheduler.cancel()` / `.suspend()` — mirrors `cancel-reminder-on-habit-archived.handler.ts` / `cancel-reminder-on-terminal-state.handler.ts`                                               |

`resolveReminderDateTime()` in that same file does the offset math client-side today (so the UI can show a live preview) — the exact computation a server-side scheduling service would also need to do.

## Why this round doesn't wire Task into the real engine

Extending the engine to Task requires:

1. Adding `'task'` to `ReminderSourceType` (packages/domain) — a domain change.
2. A `TaskReminderSchedulingService` mirroring `HabitReminderSchedulingService`.
3. New event handlers (schedule-on-task-created, cancel-on-task-completed/cancelled, reschedule-on-due-date-changed…).
4. A `POST tasks/:id/reminder`-style endpoint or extending `RegisterTaskCommand`/`EditTaskCommand`.

All of that is explicitly out of scope for this Stabilization Sprint round ("No modificar ADR-020/021/022, no introducir cambios de dominio"). What was built instead is a **client-side-only** reminder store (`apps/mobile/src/core/reminders/use-reminder-store.ts`, Zustand + secureStorage, keyed by `${entityKind}:${entityId}`) that captures the same settings shape without touching `tasksApi`, the domain package, or any backend endpoint. It is a UI/UX foundation, not a working delivery mechanism — no push notification is actually scheduled or sent yet for a Task reminder. Swapping the store's `setReminder`/`getReminder` for real API calls once the backend side above is built is a small, contained change (the call sites are already isolated to `use-reminder-store.ts` and `TaskForm.tsx`'s save handler).

## Extending to other entities later (Goal, Commitment enrichment, Coach)

Because `ReminderEntityKind` (mobile) and `ReminderSourceType` (backend) are already both open unions rather than a Task-specific type, the same `ReminderSection` component and `useEntityReminder(kind, id)` hook are reusable as-is for any entity that gets a Detail/Workspace screen — no redesign, just `useEntityReminder('goal', goalId)` instead of `useEntityReminder('task', taskId)`. Commitment already has a `ReminderSourceType` entry server-side; it's the natural second candidate once its own reminder UI is prioritized.

## Future-proofing already covered by the existing design, not new work needed

- **Escalating / adaptive / AI Coach-driven reminders:** slot into `HabitReminderSchedulingService`-equivalent services per source type — the scheduling _policy_ is already isolated from the generic `Reminder` aggregate and delivery pipeline, so a smarter policy is a new service implementation, not an engine change.
- **Snooze / Reschedule as notification actions:** `NotificationMessage.metadata: Record<string,string>` already carries arbitrary data — add `{ actions: 'complete,snooze15,reschedule' }` and interpret it in the push payload / an incoming action-handling endpoint. No port signature change required.
- **Cross-device sync:** already exists — `NotificationDeviceProjectionRepository` + `devices.api.ts`/`push-registration.ts` register every device's push token per identity; `NotificationProvider.send()` is per-token, so multi-device delivery is a fan-out at the dispatcher level, not a new concept.

## Recommendation

When Task reminders (or any entity beyond Habit/Commitment) are prioritized for real delivery, treat it as **extending `apps/backend/src/notifications/`**, following the Habit handlers as the template, not designing a new "ReminderService" from scratch. The mobile-side `core/reminders/` module built this round is already positioned to hand off to that extension with minimal rework.
