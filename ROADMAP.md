# Roadmap

Version: 1.6.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-14

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
  `engineering/governance/vs031_completion_report.md` v2.0.0. Not `Closed` — uncommitted; whether
  the post-Block-A scope should retroactively split into new sprint numbers per Rule 2 is open.)
- **Sprint VS-032:** Calendar (Planned)
- **Sprint VS-033:** Reminder Settings (Planned)
- **Sprint VS-034:** Recurrence Management (Planned)
- **Sprint VS-035:** Offline First & Sync (Planned)
- **Sprint VS-036:** Search / Filters (Planned — reprogrammed from VS-031 per ADR-015)

---

## 📜 Change History

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
