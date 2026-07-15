# Engineering Board

Version: 1.5.0
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

## Current Risks & Technical Debt

Tracked in the canonical registers, not duplicated here: `RISK_REGISTER.md` and `TECH_DEBT.md`.
(An earlier version of this board briefly duplicated this content directly, before those canonical
registers — which predate this board — were found; see `TECH_DEBT.md`/`RISK_REGISTER.md` v1.2.0/
v1.1.0 change history.)

**Still open, requiring a product/architecture decision (not just tracking):**

- **VS-031 scope expansion.** What shipped absorbed Habits, Goals, Insights, Coach, Theme Engine,
  and an accessibility pass — well past its original Block A. Code is now committed (`1a3f598`,
  `7853f22`); the open question is whether to retroactively split this into new sprint numbers per
  ADR-016 Rule 2.

---

## 📜 Change History

- **v1.5.0 (2026-07-14):** Discovered `TECH_DEBT.md`/`RISK_REGISTER.md` already exist as canonical
  registers (were not read before this point in the session). Migrated the "Current Risks" block
  added in v1.4.0 into those registers instead of duplicating; kept only the one still-open
  product/architecture decision (VS-031 retroactive scope split) here.
- **v1.4.0 (2026-07-14):** VS-031 marked Completed (verified, not Closed — see
  `vs031_completion_report.md` v2.0.0). Added a "Current Risks" block per user feedback so the
  board tracks open governance/technical risks, not just the priority list.
- **v1.3.0 (2026-07-12):** Reconciled priorities against actual commit history. Marked
  VS-025–VS-028 and VS-030 Completed (self-labeled), left VS-029 Planned, set VS-031 (Product
  Experience Foundation, reassigned from Search/Filters per ADR-015) as the active priority.
- **v1.2.0 (2026-07-08):** Set active priority to VS-025 Dashboard v2 and updated upcoming priorities.
- **v1.1.0 (2026-07-04):** Transitioned epic and priorities to track the active Vertical Slice epic.
- **v1.0.0 (2026-07-04):** Integrated as the official engineering board log at the root level.
