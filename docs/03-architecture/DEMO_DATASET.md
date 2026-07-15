# Demo Dataset — Canonical Contract

**Status:** Contract frozen as of VS-031 Phase 5 (2026-07-13); content
extended per that contract in Phase 9 (2026-07-14) — see "The 7 Goals"
below for the current counts. Every new feature that needs demo content
extends this dataset — it does not create a parallel one.

## Why this document exists

Before Phase 5, demo data was built feature-by-feature: commitments and
tasks were seeded together, habits were seeded independently with no
relationship to commitments, and Goals didn't exist at all. That's how
`docs/03-architecture/adr_017_i18next_singleton_resolution.md`-style
inconsistencies happen at the data layer instead of the module-resolution
layer — two features quietly assume two different "truths" about the same
user.

Phase 5 introduced `Goal` as the top-level entity and rebuilt the dataset
around one rule: **every entity below Goal links to it, and nothing is
generated to fill a screen that isn't derived from something that already
exists.**

## Entity hierarchy

```
Goal
 ├── Commitment (1 goalId each — every Commitment belongs to exactly one Goal)
 │    └── Task (commitmentId — a Commitment's own tasks)
 ├── Habit (goalId — most habits belong to a Goal; not required)
 └── Milestone (goalId — 2–3 checkpoints per Goal)

Task (standalone / "general")
 └── no commitmentId — inbox-style tasks not tied to any Commitment or Goal
```

Reverse lookups exist too (`commitmentGoalId` map in `demo-data.ts`), so a
Task can answer "which Goal is this ultimately part of?" by following
`task.commitmentId → commitment.goalId`.

## Where each entity lives

| Entity                | File                                                                    | Notes                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Goal                  | `apps/mobile/src/core/demo/demo-goals.repository.ts`                    | 7 seeds (`g-01`–`g-07`)                                                                                                         |
| Commitment            | `apps/mobile/src/core/demo/demo-data.ts` (`COMMITMENT_SEEDS`)           | 17 seeds (`c-01`–`c-17`), each has `goalId`                                                                                     |
| Task                  | `apps/mobile/src/core/demo/demo-data.ts` (`buildDemoTasks`)             | derived from Commitments' `taskCount`/`progressRatio`, plus 9 standalone "general" tasks                                        |
| Habit                 | `apps/mobile/src/core/demo/demo-habits.repository.ts`                   | 9 seeds (`h-01`–`h-09`), each has `goalId`                                                                                      |
| Milestone             | `apps/mobile/src/core/demo/demo-goals.repository.ts` (`demoMilestones`) | 2–3 per Goal, 20 total. `toggleMilestone` (Phase 9) flips `completed` — same pattern as `demoHabitsRepository.complete()`       |
| Calendar / Agenda     | _(no separate store)_                                                   | derived at render time from Task/Commitment/Habit via `buildDayAgenda` (`packages/domain/src/calendar`)                         |
| Coach recommendations | _(no separate store)_                                                   | derived at render time from `DashboardContext` via `CoachRecommendationProvider`, plus `useGoalFocus` for Goal-specific insight |

**Rule: if you're about to add a `demo-<feature>-data.ts` file with its own
seed array of people/titles/dates, stop.** Check whether what you need can
be _derived_ from Goal/Commitment/Task/Habit/Milestone instead. Insights
(Phase 6), Achievements, and Risk scenarios are all meant to be computed
views over this same dataset, not new datasets.

## The 7 Goals

| id     | title                      | category | commitments            | habits           |
| ------ | -------------------------- | -------- | ---------------------- | ---------------- |
| `g-01` | Improve Physical Health    | health   | c-01, c-03, c-12, c-15 | h-01, h-05, h-07 |
| `g-02` | Improve Mental Wellbeing   | personal | c-09, c-10             | h-02             |
| `g-03` | Build Financial Freedom    | finance  | c-04, c-13             | —                |
| `g-04` | Become More Productive     | career   | c-02, c-08, c-11, c-14 | h-04             |
| `g-05` | Learn Portuguese           | learning | c-06, c-16             | h-03, h-08       |
| `g-06` | Keep Reading               | learning | c-05                   | h-06             |
| `g-07` | Build Better Relationships | personal | c-07, c-17             | h-09             |

All 17 Commitments and all 9 Habits are accounted for — nothing is
orphaned, nothing is double-linked. `g-05` and `g-07` (Phase 9) were the
thinnest goals as of Phase 5 — `g-07` in particular had zero linked
Habits — and got one more Commitment + Habit + Milestone each, following
the same rules as everything else here (computed progress, no independent
random numbers, day-granularity dates via the existing `daysFromNow`/
`daysAgo`/`ANCHOR` helpers).

## Consistency rules (never violate these when extending)

1. **No independently-random numbers.** Every displayed metric is either a
   seed value with a stated narrative reason, or computed from other
   entities. Progress bars, streaks, and completion rates must trace back
   to something concrete.
2. **Goal progress is never stored — always computed.**
   `computeGoalProgress()` (`packages/domain/src/goal/engine`) derives it
   from linked Commitments' task-completion ratios and the Goal's
   Milestone completion ratio. A Commitment's own progress
   (`computeCommitmentProgressRatio()` in `demo-data.ts`) is likewise
   derived from its Tasks, not read from a stored field.
3. **Dates are day-granularity unless a real time exists.** Seed dates are
   normalized to midnight (`today()` in `demo-data.ts`) — nothing carries
   the wall-clock time Metro happened to boot at. `AgendaItem.time` is
   `undefined` unless a source genuinely has a time component.
4. **Every new demo entity links to an existing one.** A new Habit needs a
   `goalId`. A new Task should carry a `commitmentId` when it logically
   belongs to one. A "general" (no `commitmentId`) Task is a deliberate
   choice for Inbox-style content, not a default.
5. **Task/Habit/Commitment titles are illustrative content, not UI copy.**
   They stay as literal strings (not i18n keys) per the same rule already
   applied to `demo-data.ts` — but UI labels, section headers, and empty
   states around them must still go through `@commitment/localization`.

## Extending this dataset (read before adding a new phase's demo data)

- **Insights (Phase 6):** build views that group existing Tasks/Commitments
  by `goalId`, not a new insights-specific dataset.
- **Coach:** `CoachRecommendationProvider` reasons over `DashboardContext`
  (aggregate counts) for general rules; anything that needs to name a
  specific Goal goes through `useGoalFocus()` instead, which queries Goals
  directly. Both read the same underlying Commitment/Task/Habit data —
  neither should invent its own.
- **Demo Experience (Phase 9):** extending "realism" means adding more
  Goals/Commitments/Tasks/Habits/Milestones following the rules above —
  richer Achievements, Risk scenarios, and upcoming schedules should all be
  computed rules over the existing entities (see `CoachRecommendationProvider`
  for the pattern: a rule reads context, decides whether to surface
  something — it doesn't fabricate content).
- **Offline / Cloud Sync / AI Coach (VS-032+):** when a real backend Goal
  module ships, `goalsApi.ts` swaps its demo-only routing for the same
  `isDemoModeActive()` branch `commitments.api.ts` already uses — the
  shape of `DemoGoalDTO` was chosen to map cleanly onto the real `Goal`
  aggregate in `packages/domain/src/goal` when that day comes.

## Known gaps (deliberate, not hidden)

- Notes, Attachments, and Activity Timeline (Goal Workspace sections) have
  no backing data at all yet — they render elegant empty states
  (`goals.workspace.notesEmpty` etc.), not a fake populated list. Give them
  a real store here, in this same file, when they're built — not a
  separate one.
