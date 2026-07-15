# Engineering Board

Version: 1.4.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-14

---

## Current Epic

Epic VS — Vertical Slice Product Phase

## Priorities

- **VS-025:** Dashboard Experience Foundation (Completed — self-labeled)
  - _Track A:_ Dashboard Layout (Container structure, adaptive layout, header, greeting)
  - _Track B:_ Dashboard Widgets (TodayWidget, WeeklyProgressWidget, QuickActionsWidget, StreakWidget plugins)
  - _Track C:_ Motion System (Entrance animations, card transitions, Pull to Refresh)
  - _Track D:_ Accessibility (VoiceOver, Dynamic Type, Large Fonts, Reduced Motion)
  - _Track E:_ Dashboard Design System (KPI Cards, premium skeletons, empty states, role semantic tokens)
- **VS-026:** Theme Engine Foundation (Completed — self-labeled)
- **VS-027:** Experience Themes (Completed — self-labeled)
- **VS-028:** Widget Registry (Completed — self-labeled)
- **VS-029:** Motion System (Planned — no commit evidence found)
- **VS-030:** Accessibility & Polish (Completed — self-labeled; accessibility criteria not independently verified)
- **VS-031:** Product Experience Foundation (Completed, verified — see
  `engineering/governance/vs031_completion_report.md` v2.0.0; not Closed, uncommitted)

Full evidence and confidence levels: `engineering/governance/roadmap_reconciliation_2026Q3.md` and,
for VS-031 specifically, `engineering/governance/vs031_completion_report.md`.

---

## Current Risks

- **Working tree not committed.** 218 files of functional changes (Habits, Goals, Insights,
  Theme Engine, Commitment Priority, accessibility pass, demo dataset) exist only locally. Nothing
  in this board or the roadmap is reproducible from `git log` until this is committed.
- **VS-031 scope expansion pending governance decision.** What shipped absorbed Habits, Goals,
  Insights, Coach, Theme Engine, and an accessibility pass — well past its original Block A. Needs
  a product/architecture call on whether to retroactively split into new sprint numbers (ADR-016
  Rule 2) once the code is committed.
- **`walkthrough.md` is obsolete.** Still describes the mobile client as Flutter and only covers
  Sprint 0/1. Needs a dedicated rewrite pass; not attempted here to avoid introducing inaccurate
  "compliance" under time pressure.
- **Calendar cold-load localization bug.** `/calendar`'s date/weekday header renders in English on
  a cold direct URL load (works correctly via in-app navigation). Root cause not isolated — see
  `vs031_completion_report.md` §2/§4. Low severity, does not affect normal navigation.
- **Progress/maturity table was partially stale.** Fixed 2026-07-14 for the areas this session
  verified (Theme Engine, Dashboard, Habits, Goals, Insights, Coach, Accessibility); the remaining
  rows in `PROJECT_STATUS.md` are still carried over from 2026-07-08 and need their own audit.

---

## 📜 Change History

- **v1.4.0 (2026-07-14):** VS-031 marked Completed (verified, not Closed — see
  `vs031_completion_report.md` v2.0.0). Added a "Current Risks" block per user feedback so the
  board tracks open governance/technical risks, not just the priority list.
- **v1.3.0 (2026-07-12):** Reconciled priorities against actual commit history. Marked
  VS-025–VS-028 and VS-030 Completed (self-labeled), left VS-029 Planned, set VS-031 (Product
  Experience Foundation, reassigned from Search/Filters per ADR-015) as the active priority.
- **v1.2.0 (2026-07-08):** Set active priority to VS-025 Dashboard v2 and updated upcoming priorities.
- **v1.1.0 (2026-07-04):** Transitioned epic and priorities to track the active Vertical Slice epic.
- **v1.0.0 (2026-07-04):** Integrated as the official engineering board log at the root level.
