# Roadmap

Version: 1.15.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-19

---

## Sprints

- **Sprint G0:** Handbook & Governance (Completed)
- **Sprint G1:** Bounded Context Domain Foundations (Completed)
- **Sprints VS-001 to VS-023:** Core Lifecycle Management (Completed)
- **Sprint VS-024:** Activity History & Auditing (Completed)
- **Sprint VS-025:** Dashboard Experience Foundation (Completed — self-labeled per commit `cc8b6ed`; scope defined in ADR-014 §6)
  - _Track A:_ Dashboard Layout (Container structure, adaptive layout, header, greeting)
  - _Track B:_ Dashboard Widgets (TodayWidget, WeeklyProgressWidget, QuickActionsWidget, StreakWidget plugins)
  - _Track C:_ Motion System (Entrance animations, card transitions, Pull to Refresh)
  - _Track D:_ Accessibility (VoiceOver, Dynamic Type, Large Fonts, Reduced Motion)
  - _Track E:_ Dashboard Design System (KPI Cards, premium skeletons, empty states, role semantic tokens)
- **Sprint VS-026:** Theme Engine Foundation (Completed — self-labeled per commit `fe279de`)
- **Sprint VS-027:** Experience Themes (Completed — self-labeled per commit `74f75ec`)
- **Sprint VS-028:** Widget Registry (Completed — self-labeled per commit `29d3bda`)
- **Sprint VS-029:** Motion System (Planned — no commit evidence found; not started)
- **Sprint VS-030:** Accessibility & Polish (Completed — self-labeled per 8 `vs-030` commits; scope vs. ADR-014 §6 accessibility criteria not independently verified, see `engineering/governance/roadmap_reconciliation_2026Q3.md` §2)
- **Sprint VS-031:** Product Experience Foundation (Completed, verified — grew far past Block A to
  cover Habits, Goals/Milestones, Insights, Commitment Priority, Theme Engine redesign, Coach, an
  accessibility pass, and the canonical demo dataset; see
  `engineering/governance/vs031_completion_report.md` v2.2.0. Not `Closed` — committed (`1a3f598`,
  `7853f22`), but whether the post-Block-A scope should retroactively split into new sprint
  numbers per Rule 2 is still an open decision.)
- **Sprint VS-032:** Calendar (Planned) — **stale entry, not reconciled by this update.** Per
  `PROJECT_STATUS.md`/`ENGINEERING_BOARD.md`, VS-032 actually shipped as Design System Adoption
  and closed 2026-07-16; this line predates that and was out of scope to rewrite here.
- **Sprint VS-033:** Reminder Settings (Planned)
- **Sprint VS-034:** Recurrence Management (Planned)
- **Sprint VS-035:** Offline First & Sync (Planned)
- **Sprint VS-036:** Search / Filters (Planned — reprogrammed from VS-031 per ADR-015)
- **Epic: Task Capability Completion — `Closed` (2026-07-19)**, opened 2026-07-19 — closed the
  post-ADR-021/ADR-022 Stabilization Sprint. Connected `Task` fields already modeled in the domain
  (`estimatedMinutes`, `actualMinutes`, `dueDate`, `startDate`, `tags`, `metadata`) through the
  UI/API/Calendar/Progress layers that didn't expose them. Full backlog: `ENGINEERING_BOARD.md`;
  source analysis: `docs/03-architecture/task_domain_review.md`. All 6 stories done: Story 1 (expose
  `estimatedMinutes` in `TaskForm`), Story 2 (calendar duration — found already satisfied by
  pre-existing code), Story 3 (`ScheduleTaskCommand`), Story 4 (`ReminderSourceType('task')`), Story 5
  (planning metrics data layer — UI presentation spun out below), Story 6 (`startDate`/`tags`/
  `metadata` mapped into `TaskModel`). Two small, deliberate domain touches across the whole epic,
  both flagged in advance, not silent: widening `ReminderSourceType`'s closed union (Story 4) and
  enriching `TaskDueDateChangedEvent`'s payload with `identityId` (a bug fix found during Story 4's
  live verification) — neither adds a new domain concept. Three future epics spun out of findings made
  while closing this one, each requiring its own product/UX scoping before starting: **Calendar 2.0 /
  Time Blocking**, **Cross-platform Date Picker Parity**, **Insights / Analytics** (all below).
- **Product Polish / Stabilization: `Complete` (2026-07-19)**, user-declared close of everything
  since ADR-022, including the Design System consolidation that followed Task Capability Completion
  (`SelectableField`, `ChoiceGroup`, `TECH_DEBT.md` Items 43/44). **ADR-023 (Habit↔Commitment
  Relationship): `Decided` (2026-07-19)** — domain review found no relationship exists in any layer;
  user rejected mirroring Task's ownership pattern from ADR-022 (a Habit's identity-building nature
  doesn't share Task's single-plan scoping) in favor of a weak association
  (`Habit.commitmentIds[]`, 0..n, no cascades, no ownership — following the already-shipped
  `Goal.commitmentIds[]` precedent from ADR-021). Model decided, not implemented. See
  `docs/03-architecture/adr_023_habit_commitment_relationship.md`.
- **Epic: Calendar 2.0 / Time Blocking** (Status: **Future**, not started, registered 2026-07-19) —
  explicitly split out of Task Capability Completion's Story 2, which only covers showing
  `estimatedMinutes` as a compact text label (already shipped). This epic is the bigger idea from
  that conversation: tasks as **proportional visual time blocks** on an hour-by-hour grid
  (e.g. 2:15 PM → 3:00 PM occupying real vertical space), not a flat chronological list. A
  materially different UI paradigm from the current `calendar.tsx` — needs its own scoping pass
  before starting, not a Task Capability Completion story. Candidate scope once prioritized:
  proportional blocks, hour-by-hour timeline, overlap handling, temporal scroll/zoom, drag & drop,
  availability, Focus Sessions integration, AI Scheduling, responsive layout.
- **Epic: Cross-platform Date Picker Parity (Web / iOS / Android)** (Status: **Future**, not started,
  registered 2026-07-19) — explicitly split out of Task Capability Completion's Story 3. Found while
  verifying Story 3 live: `ControlledDatePicker`/`PlainDateTimePicker` (`apps/mobile/src/shared/
forms/`) render a functional picker on iOS (inline) and Android (modal), but on web the date button
  opens nothing at all — confirmed pre-existing (predates this session) and cross-cutting, affecting
  every form that uses either component: Task, Habit, and Commitment today, and any future form that
  reuses them. Not a `ScheduleTaskCommand`/Story 3 defect — it's a Design System / multi-platform
  forms gap, so it doesn't belong inside Task Capability Completion. Tracked for now as `TECH_DEBT.md`
  Item 43; promote to its own story (or fold into the already-planned Fase 2.6 "Form system
  modernization") once prioritized, rather than an ad hoc fix bolted onto whichever entity's form
  happens to surface it next.
- **Epic: Insights / Analytics** (Status: **Future**, not started, registered 2026-07-19) — candidate,
  not yet an epic with real scope. Placeholder for product/UX decisions the data layer has outpaced:
  Task Capability Completion's Story 5 added `plannedMinutes`/`completedMinutes`/`remainingMinutes`/
  `completionRatio` (both per-day on `DailyMetricsPoint` and per-week on `WeekWindowMetrics`,
  `packages/domain/src/insights/InsightsContext.ts`) — real, computed, tested data, available today
  for any consumer. What's undecided is presentation: the Insights Overview
  (`InsightsLayoutEngine.ts`) is documented in its own code as a fixed 4-card layout ("no
  runtime-varying membership") — whether "comprometido vs completado" replaces an existing card,
  becomes a 5th (breaking that fixed contract), gets its own screen, or feeds the Coach/Calendar
  instead of the Overview at all is a product/UX call, deliberately not made incidentally inside a
  data-layer story. Scope it properly (review the 4-card contract first) when prioritized.

---

## 📜 Change History

- **v1.15.0 (2026-07-19):** **ADR-023 decided.** Weak Habit↔Commitment association chosen over
  mirroring Task's ownership pattern — see `ENGINEERING_BOARD.md` v1.62.0 and
  `docs/03-architecture/adr_023_habit_commitment_relationship.md`.
- **v1.14.0 (2026-07-19):** Product Polish / Stabilization cycle marked `Complete`. **ADR-023 (Habit
  Lifecycle) moved to `Active`**, greenlit by the user with an explicit request to keep the same
  discipline that ran through this whole cycle (verify first, extend before duplicating). See
  `ENGINEERING_BOARD.md` v1.60.0's Working Principles.
- **v1.13.0 (2026-07-19):** **Task Capability Completion epic `Closed`.** Story 6 (`startDate`/`tags`/
  `metadata` → `TaskModel`) done, confirming zero backend/domain changes were needed — purely mobile
  plumbing. Found and fixed a real, previously-shipped bug: `tasksApi.schedule()` never sent
  `startDate`, silently clearing it on every reschedule via the backend's `?? null` fallback. All 6
  stories now closed; three future epics (Calendar 2.0, Cross-platform Date Picker Parity, Insights/
  Analytics) spun out along the way, each needing its own product/UX scoping before starting. See
  `ENGINEERING_BOARD.md` v1.54.0.
- **v1.12.0 (2026-07-19):** Task Capability Completion's Story 5 (`plannedMinutes`/`completedMinutes`/
  `remainingMinutes`/`completionRatio`) data layer closed. Added a new **Epic: Insights / Analytics**
  (Status: Future, not started) as the home for the deferred UI-presentation decision — the Insights
  Overview's fixed 4-card layout needs a product/UX call this story deliberately didn't make. See
  `ENGINEERING_BOARD.md` v1.53.0.
- **v1.11.0 (2026-07-19):** Task Capability Completion's Story 4 (`ReminderSourceType('task')`)
  closed — Domain Exposure Verification confirmed the Reminder engine was already generic, wired Task
  into it mirroring Commitment's pattern, verified end-to-end against the real backend. Deliberately
  did not build the mobile UI's opt-in reminder-toggle endpoint (needs its own product decision, no
  existing precedent to mirror). Separately verified a "planned execution time" (`scheduledAt`)
  concept doesn't already exist in the domain — confirmed as new surface, not implemented. See
  `ENGINEERING_BOARD.md` v1.52.0.
- **v1.10.0 (2026-07-19):** Task Capability Completion's Story 3 (`ScheduleTaskCommand`) closed —
  verified end-to-end against the real backend. Split the web date-picker gap found during that
  verification out of Task Capability Completion into a new **Cross-platform Date Picker Parity
  (Web / iOS / Android)** epic (Status: Future, not started) — it's a Design System / forms issue
  affecting Task, Habit, and Commitment alike, not specific to Task or to `ScheduleTaskCommand`. See
  `ENGINEERING_BOARD.md` v1.51.0, `TECH_DEBT.md` Item 43.
- **v1.9.0 (2026-07-19):** Marked Task Capability Completion's Story 1 and Story 2 done. Split the
  "proportional visual time-block" calendar idea out of Story 2 into a new **Calendar 2.0 / Time
  Blocking** epic (Status: Future, not started) — a materially bigger UI paradigm than this epic's
  exposure-only scope, deliberately not built as part of Task Capability Completion. See
  `ENGINEERING_BOARD.md` v1.49.0.
- **v1.8.0 (2026-07-19):** Added Epic "Task Capability Completion" (opened 2026-07-19, closes the
  post-ADR-021/ADR-022 Stabilization Sprint — see `PROJECT_STATUS.md` v1.69.0,
  `ENGINEERING_BOARD.md` v1.48.0). Flagged the VS-032 entry above as known-stale (actually shipped
  as Design System Adoption, closed 2026-07-16) rather than silently rewriting it without full
  reconciliation context.
- **v1.7.0 (2026-07-14):** VS-031's working-tree changes committed (`1a3f598`, `7853f22`) —
  superseding v1.6.0's "pending commit" note. Retroactive sprint-scoping decision (ADR-016 Rule 2)
  remains open. Also: a systemic i18n architecture violation was found (see `TECH_DEBT.md` Item 3)
  and an iCloud Desktop sync corruption hazard was found and mitigated mid-commit (see
  `RISK_REGISTER.md` Risk 3) — neither changes VS-031's Completed status but both are worth knowing
  before starting VS-032.
- **v1.6.0 (2026-07-14):** VS-031 marked Completed (verified — see
  `engineering/governance/vs031_completion_report.md` v2.0.0), not Closed pending commit of 218
  working-tree files and a product decision on retroactive sprint scoping.
- **v1.5.0 (2026-07-12):** Reconciled roadmap against actual commit history (see
  `engineering/governance/roadmap_reconciliation_2026Q3.md`). Marked VS-025–VS-028 and VS-030 as
  Completed (self-labeled), left VS-029 Planned (no evidence of work), reassigned VS-031 from
  Search/Filters to Product Experience Foundation per ADR-015, and added VS-036 (Search/Filters
  reprogrammed).
- **v1.4.0 (2026-07-08):** Aligned sprint order for VS-026 (Theme Engine Foundation) and VS-027 (Experience Themes) and bumped version.
- **v1.3.0 (2026-07-08):** Reordered dashboard experience sprints VS-025 to VS-030 and bumped version.
- **v1.2.0 (2026-07-08):** Completed VS-024, reordered sprints VS-025 to VS-031, and added new future sprints VS-032 to VS-035.
- **v1.1.0 (2026-07-04):** Transitioned roadmap phases to reflect Vertical Slice active development sprints.
- **v1.0.0 (2026-07-04):** Integrated as the official project roadmap at the root level.
