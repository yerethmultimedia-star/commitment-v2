# Technical Debt Register

Version: 1.2.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-14

---

This document tracks identified technical debt, compilation warnings, and architectural compromises, outlining their impact, priority, and recommended resolution steps.

---

## Active Technical Debt Item 3: Systemic violation of i18n Rule 2 (declarative-only translation)

- **Description:** `docs/ARCHITECTURE_OVERVIEW.md` §11 Rule 2 states Features must never call `t()`
  directly and must instead pass `i18nKey` props to Design System components. Verified against the
  actual codebase (2026-07-14): **26 files** under `apps/mobile/src/app` and
  `apps/mobile/src/features` call `useTranslation()` directly, including `calendar.tsx`,
  `login.tsx`, `onboarding.tsx`, `EditCommitmentScreen.tsx`, `CommitmentForm.tsx`,
  `TodayHabitsScreen.tsx`, and others. This is the dominant pattern in code written across this
  project's recent Habits/Goals/Insights/Coach/Theme work, not an isolated exception.
- **Impact:** This is an architecture-principle violation, not (currently) a functional bug —
  translations work correctly. The risk is drift: without the declarative-only discipline, nothing
  prevents a future edit from introducing an untranslated string or a component that doesn't
  re-render on language change (see the exact class of bug already found and partially fixed this
  session — Calendar's `formatWeekday`/`formatDate`, item below). Some of the 26 sites are calling
  `t()` for reasons the declarative pattern cannot currently express (e.g. Expo Router's
  `Stack.Screen options={{ title: t(...) }}` needs a plain string, not a component prop) — Rule 2
  as written doesn't document this exception.
- **Priority:** Medium-High. Systemic scope (26 files) means a rushed fix is more likely to
  introduce regressions than to help; this needs a dedicated pass, not a quick patch.
- **Recommended Resolution:** Before refactoring any of the 26 files, resolve the open question of
  whether Rule 2 needs a documented, narrow exception (e.g. for native-API props that require plain
  strings) via an ADR, or whether every one of those 26 sites can genuinely be migrated to a
  declarative pattern (e.g. a `useTranslation()`-free `i18nKey`-only variant of `Stack.Screen`).
  Deferred pending that architectural decision — not started.

---

## Active Technical Debt Item 4: Calendar cold-load date/weekday formatting falls back to English

- **Description:** `/calendar`'s date/weekday header (`formatWeekday`/`formatDate` from
  `@commitment/localization`) renders in English instead of the active Spanish locale, but only on
  a cold direct URL load (hard refresh) — confirmed correct via normal in-app navigation. A
  dual-`i18next`-module-instance cause was investigated and ruled out (only one `i18next` module is
  present in the served web bundle). A defensive `i18n.language` subscription fix was applied but
  did not resolve the cold-load case.
- **Impact:** Low severity — does not reproduce under normal product usage, only a hard refresh of
  one specific deep link.
- **Priority:** Low.
- **Recommended Resolution:** Needs a deeper Metro/Expo-Router hydration-timing investigation than
  was in scope during discovery. Not started.

---

## Active Technical Debt Item 5: `HeroCardStrategy` deprecated but not removed

- **Description:** `HeroCardStrategy` was explicitly deprecated in-code (migration note, not
  deleted) when the Dashboard engine layer (Block A) shipped. `DashboardHeroCard` was later rebuilt
  with a `kind`-based switch (`generic`/`priorityTask`); whether the old strategy file is now fully
  dead code was not re-checked when that rebuild happened.
- **Impact:** Low — dead code risk, not a functional issue.
- **Priority:** Low.
- **Recommended Resolution:** Confirm `HeroCardStrategy` has no remaining references, then delete.
  Not started.

---

## Active Technical Debt Item 6: `apps/backend` `tsc --noEmit` has 2 pre-existing errors in test files

- **Description:** `register-commitment.nestjs-handler.spec.ts` (wrong arg count) and
  `schedule-reminder-on-queued.handler.spec.ts` (mock type mismatch — missing `cancel` on a mocked
  `ReminderExecutionEngine`). Both are confirmed pre-existing and unrelated to any of this
  project's recent Habits/Goals/Insights/Coach work (untouched files); the corresponding tests pass
  at runtime regardless (ts-jest's runtime type-checking is looser than a standalone `tsc` pass).
- **Impact:** Low — cosmetic typecheck noise, does not block builds or test runs.
- **Priority:** Low.
- **Recommended Resolution:** Fix the mock type and the handler call-site's argument count. Not
  started.

---

## Active Technical Debt Item 7: Accessibility and Feature Independence not audited against a formal standard

- **Description:** A repo-wide `accessibilityLabel`/`accessibilityRole`/`accessibilityState`/
  touch-target pass was done across ~20 screens (2026-07-14), following this repo's own established
  token/label conventions — not a formal third-party WCAG AA audit tool. Similarly, "Feature
  Independence" (per the 7-category product review structure) has never been audited at the source
  level for any recently-shipped vertical (Habits/Goals/Insights/Coach).
- **Impact:** Unknown — the conventions followed are reasonable but unverified against an
  independent standard.
- **Priority:** Medium.
- **Recommended Resolution:** Run a formal WCAG AA audit tool against the built web output; define
  and run a Feature Independence check (e.g. can Habits be disabled/removed without breaking Goals
  or Coach?). Not started.

---

## Active Technical Debt Item 1: Jest Hybrid Module Warnings (TS151002)

- **Description:** Testing execution in `@commitment/domain` displays warnings: `ts-jest[config] (WARN) message TS151002: Using hybrid module kind (Node16/18/Next) is only supported in "isolatedModules: true".`
- **Impact:** Clutters terminal outputs during local validation runs and CI pipelines, reducing developer feedback readability. Does not block build execution or compilation.
- **Priority:** Low
- **Recommended Resolution:** Update the `@commitment/domain` package `tsconfig.json` to include `"isolatedModules": true` or configure `ts-jest` config blocks to ignore code `151002` diagnostics. _Deferred to EPIC-001 (TASK-001)._

---

## Active Technical Debt Item 2: TD-003 — Redundant Idempotency Logic in Handlers

- **Description:** Review the handlers for Activate and Pause to verify they do not contain business decisions (including idempotency). If they exist, move them to the aggregate to maintain the domain's exclusive responsibility.
- **Impact:** Redundant business logic in the orchestrator layer (handlers) violates CQRS orchestration rules and dilutes the aggregate's authority over state transitions, risking inconsistencies if the domain logic evolves.
- **Priority:** Medium
- **Recommended Resolution:** Remove handler-level `if (commitment.state === ...)` checks for Activate and Pause, ensuring the Domain Aggregate fully handles these state idempotency rules natively.

---

## 📜 Change History

- **v1.2.0 (2026-07-14):** Registered items 3-7, migrated from duplicate tracking that had been
  created in `ENGINEERING_BOARD.md` and `engineering/governance/vs031_completion_report.md` before
  this canonical register was discovered to already exist — see
  `engineering/governance/vs031_completion_report.md` for the discovery note. Most significant:
  item 3, a systemic 26-file violation of the i18n Rule 2 declarative-UI architecture principle.
- **v1.1.0 (2026-07-05):** Registered TD-003 regarding redundant idempotency logic in Activate/Pause handlers.
- **v1.0.0 (2026-07-04):** Formatted log structure and registered the hybrid ES module compiler warning.
