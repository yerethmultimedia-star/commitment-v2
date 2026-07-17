# Decision Log

Version: 1.6.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-15

---

## Logged Architecture Decisions

- **ADR-011:** Preferred Tech Stack Flexibility (Approved, [adr_011_tech_stack_flexibility.md](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/adr_011_tech_stack_flexibility.md))
- **ADR-012:** Governance Framework (Approved, integrated under [docs/00-governance/](file:///Users/yereth/Desktop/Commitment-v2/docs/00-governance/))
- **ADR-013:** Internationalization First & Declarative UI (Approved, [adr_013_internationalization_first.md](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/adr_013_internationalization_first.md))
- **ADR-014:** Activity History & Experience Themes Subsystem (Approved, [adr_014_activity_history_recommendations.md](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/adr_014_activity_history_recommendations.md))
- **ADR-015:** Roadmap Reprioritization (2026 Q3) (Approved, [adr_015_roadmap_reprioritization.md](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/adr_015_roadmap_reprioritization.md))
- **ADR-016:** Sprint Governance Rules (Approved, [adr_016_sprint_governance_rules.md](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/adr_016_sprint_governance_rules.md))
- **ADR-017:** Metro Module Resolution Hazards — i18next Singleton + Tamagui Platform Builds (Approved, [adr_017_i18next_singleton_resolution.md](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/adr_017_i18next_singleton_resolution.md))
- **ADR-018:** Bounded Exceptions to i18n Rule 2 — React Navigation `options`, `ThemePreviewCard` (Approved, [adr_018_i18n_rule2_exceptions.md](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/adr_018_i18n_rule2_exceptions.md))

---

## 📜 Change History

- **v1.6.0 (2026-07-15):** Registered ADR-018: two narrow, verified exceptions to i18n Rule 2
  (declarative-only translation) — React Navigation route `options` fields read outside React's
  render cycle, and `ThemePreviewCard.tsx`'s intentional Design-System avoidance to escape ambient
  theme context. Both require passing a demonstrable-restriction test, not general permission to
  call `t()` where convenient.
- **v1.5.0 (2026-07-13):** Extended ADR-017 with a second, related finding from the same sprint:
  a static (non-platform-aware) `unstable_conditionNames` in `metro.config.js` was forcing every
  Tamagui package to resolve its `react-native` build even when bundling for web, crashing any
  screen using `<Select>` (`Tasks`, `Create Commitment`) with a `<Adapt>` context error. Fixed by
  removing the static list and letting Expo's per-platform defaults apply. Retitled the ADR to
  cover both Metro resolution hazards.
- **v1.4.0 (2026-07-12):** Registered ADR-017 (Single i18next Instance Resolution): root-caused the
  empty-text bug across every `i18nKey`-based Design System component to a dual ESM/CJS i18next
  instance split, fixed via `peerDependency`, a `pnpm.overrides` pin, aligned `typescript`
  devDependency versions, and a Metro resolver that forces a single physical module.
- **v1.3.0 (2026-07-12):** Registered ADR-015 (Roadmap Reprioritization: VS-031 reassigned from
  Search/Filters to Product Experience Foundation; Search/Filters moved to VS-036) and ADR-016
  (Sprint Governance Rules: mandatory doc sync on sprint close, no sprint-number reuse without an
  ADR, Sprint Freeze lifecycle). Corrected header version, which had drifted out of sync with this
  change history.
- **v1.2.0 (2026-07-12):** Approved ADR-013 for Mandatory Internationalization & Declarative UI.
- **v1.1.0 (2026-07-08):** Registered ADR-014 for Activity History recommendations and Experience Themes subsystem.
- **v1.0.0 (2026-07-04):** Integrated as the official decision log at the root level.
