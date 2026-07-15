# VS-031 Completion Report (Product Experience Foundation)

Version: 2.2.0
Status: Draft
Owner: Architecture Review Board
Date: 2026-07-14

---

## Scope Note (read this first)

This report does **not** compare implementation against a frozen specification, because none
exists. Per `engineering/governance/roadmap_reconciliation_2026Q3.md` §3 and ADR-015: no document
in this repository ever defined "VS-031: Product Experience Foundation" or its blocks before the
work was committed. The original source of scope was the commit itself (`7a49e0d`, "Dashboard
engine layer — Block A") plus the follow-up CI fix (`0f53f92`).

This report documents **what the repository observably contains**, not what was planned. Where a
claim cannot be verified from code, tests, or a direct run of the app, it is marked accordingly
rather than assumed.

### Scope amendment (2026-07-13)

Following the Product Completion audit (this document, §"What Would Be Needed to Mark VS-031
`Closed`"), the scope of VS-031 was explicitly extended — by product decision, not silently — to
cover the remaining work needed to close the gap between "engine layer exists" and "product feels
finished." VS-031 was extended to additionally cover: navigation consolidation, dashboard visual
consolidation, Insights visual consolidation (registry pattern), a Coach UI shell driven by
`RecommendationEngine`, and Theme system consolidation (WCAG audit, new Default Light theme).
Explicitly **out of scope**: real AI for Coach, real Analytics, Offline, Cloud Sync.

### Scope amendment II (2026-07-14) — read this before trusting anything below

Everything in the 2026-07-13 amendment above was delivered, and the actual work that happened
between 2026-07-12 and 2026-07-14 went considerably further than that amendment described. This
is **not** a small addendum — VS-031, as currently sitting in the working tree, now covers a
different order of magnitude of product surface than either prior version of this report
documents. In addition to the amendment-13 items, the working tree now also contains:

- A full Habit domain vertical (aggregate, recurrence engine, backend CQRS module, generalized
  Reminder aggregate, push notification wiring, mobile create/edit UI, Quick Capture integration).
- A Goal aggregate promoted to first-class root (Goal → Commitment → Task / Goal → Habit / Goal →
  Milestone hierarchy), a Goals list + Goal Workspace screen with 4 sub-tabs, and Milestone
  progress computation.
- A full Insights vertical (engine layer, registry, hooks, renderer, Focus detail screen),
  replacing an earlier "Insights Registry" approach that was itself built and then superseded.
- A `CommitmentPriority` value object threaded through the full stack (domain → backend CQRS →
  mobile), with Today's "priority of the day" hero card now ranking by commitment priority and
  deep-linking to the correct task.
- A canonical demo dataset (`docs/03-architecture/DEMO_DATASET.md`) — frozen, then twice extended
  — used to drive every screen in this report's Playwright verification.
- A repo-wide i18n reactivity fix (`useTranslation()` instead of imperative `t()` imports across 6
  design-system components, plus a Metro dual-module-instance fix for `react-i18next`), and a
  full accessibility/design-token consistency pass across essentially every screen in the app
  (`$text`/`$borderColor`/`$gray10` → semantic tokens, `accessibilityLabel`/`accessibilityRole` on
  interactive elements, hardcoded English strings removed).
- A `FloatingTabBar` replacing the previous tab navigation, and a Settings/Profile/Language screen
  redesign.

**This report does not have a clean way to attribute this to "VS-031" vs. some larger,
undocumented scope drift.** The original VS-031 (Block A) was a dashboard engine layer. What's in
the working tree now is most of the mobile app's product surface. Whether this should retroactively
be understood as "VS-031 grew very large" or as "several unnamed sprints happened without their own
governance entries" is a product/architecture judgment this report cannot make unilaterally — it is
flagged here rather than resolved silently. See the recommendation in the final section.

Guiding principle applied throughout this amendment's work (per the 2026-07-13 amendment, still
honored): _will this let future slices add functionality without re-modifying UI structure?_

---

## ⚠️ Governance-critical fact: none of this is committed

`git log` shows the last commit as `0f53f92` ("fix(mobile): repair broken CI typecheck"). Every
file discussed in this report — the entire Habit vertical, Goal/Milestone system, Insights engine,
Theme Engine redesign, Commitment Priority, demo dataset, and the Phase 8 accessibility pass — is
an **uncommitted working-tree change** (`git status --short` currently lists 218 changed/new/deleted
files). This report verifies what the code _does_ when run, not what has been _shipped_. Per
ADR-016 Rule 1, governance docs must be updated "in the same change" as the work they describe —
that rule presupposes a change (a commit) exists. None does yet. This is the single largest reason
this report recommends `Completed`, not `Closed` (see final section) — and arguably a precondition
for either label to mean anything at all.

---

## Goal

Introduce a deterministic, pure-TypeScript "engine layer" for the mobile dashboard —
`DashboardLayoutEngine` and `RecommendationEngine` — that resolves dashboard state into a layout
descriptor decoupled from React/Zustand/React Query, and wire the existing dashboard UI to consume
it. (This was VS-031's original, narrow goal — see the amendments above for how far the actual
delivered scope grew past it.)

## Implementation Details — Block A (original, committed as `7a49e0d`)

### Domain Evolution

- `packages/domain/src/dashboard/DashboardContext.ts` and `Recommendation.ts`: pure domain types,
  no framework imports.

### Application / Engine Layer

- `DashboardLayoutEngine.resolve()` — pure function, `DashboardContext` → `DashboardLayoutDescriptor`.
- `RecommendationEngine` with a composable `RuleRecommendationProvider`.
- `assertDeterministic` — a dev-only runtime guard against re-entrant/non-deterministic calls.

### Integration Layer

- `useDashboardContext` — the single boundary where Zustand/React Query are read for dashboard
  purposes.
- `DashboardRenderer`, `DashboardHeroCard` — UI components consuming the descriptor.

## Implementation Details — Blocks B onward (uncommitted, this report's actual subject)

This section is evidence-based (file paths + what running the app shows), not commit-hash-based,
since none of it is committed. Grouped by vertical:

**Habits** — `packages/domain/src/habit/` (aggregate + recurrence engine), backend `habit` CQRS
module, `Reminder` aggregate generalized from a Commitment-only shape to `sourceId`/`sourceType`
(`packages/domain/src/notifications/aggregate/reminder-source-type.ts`), mobile domain-shape
migration, push notification registration, `HabitForm`/`WeekdayPicker` create/edit UI, a dedicated
`TodayHabitsScreen` (`apps/mobile/src/features/habits/screens/TodayHabitsScreen.tsx`) showing the
full uncapped list of today-due habits, reachable from the Today widget's "Ver todos" link.

**Goals** — `packages/domain/src/goal/`, Goal.completedAt event, Milestone model + pure progress
computation functions, `GoalsScreen` (4 sub-tabs: Objetivos/Tareas/Hábitos/Roadmaps),
`GoalWorkspaceScreen` (circular progress ring, internal tabs, toggleable milestones).

**Insights** — `packages/domain/src/insights/`, engine layer (`resolveOverview()`,
`focus-detail.ts`), registry, hooks (`useInsightsOverview`, `useFocusDetail`), 5+ UI components
(Sparkline, StatCard, WeekActivityRow, FocusDayBarChart, BestWorstDayCard), rewritten
`insights.tsx` screen plus a Focus detail route.

**Commitment Priority** — `packages/domain/src/commitment/value-objects/commitment-priority.ts`
(reuses `PriorityType` from the existing `TaskPriority` VO), `CommitmentPriorityChangedEvent`,
backend DTO/command/handler/projector wiring, mobile model/mapper/API/demo-data threading, a
`CommitmentPriorityBadge` shown in `GoalTasksTab`, a priority `ControlledSelect` in
`CommitmentForm`, and Today's hero card now ranks active Commitments by priority (then that
commitment's own highest-priority pending task) instead of ranking bare tasks.

**Theme Engine** — all 4 themes (`Default`/`Amanecer`, `Medianoche`, `Bosque`, plus the original)
redesigned in `packages/theme-engine`, `$success`/`$warning`/`$danger` kept deliberately
theme-invariant by design (semantic status colors), two components that had misused `$warning` as
a decorative background (breaking that invariant) fixed to `$accent`.

**Coach** — `CoachRecommendationProvider` implementing `achievements` (streak/completion rules) and
`risks` (at-risk habit streaks, heavy pending-task days) recommendation rules, a `CoachMessageWidget`
on Today, and a full `coach.tsx` screen consuming all 7 recommendation sections.

**Navigation & Accessibility (Phase 8)** — `FloatingTabBar` (rounded, floating, pill-selected-tab,
`accessibilityRole="tab"`/`"tablist"`), a repo-wide token-consistency pass (roughly 20 files moved
off Tamagui's non-reactive default palette — `$text`/`$borderColor`/`$gray10` — onto this app's
semantic tokens), `accessibilityLabel`/`accessibilityRole`/44×44 touch-target fixes across form
fields, widgets, and profile/settings rows, an i18n reactivity fix for 6 design-system components
(imperative `t()` → `useTranslation()`), and 4 dead/orphaned files deleted
(`CommitmentsScreen.tsx` and 3 related components, confirmed unreferenced before deletion).

**Demo Dataset (Phase 9)** — `docs/03-architecture/DEMO_DATASET.md` frozen as the canonical
contract (strict Goal→Commitment/Habit/Milestone hierarchy, computed-not-stored progress, no
independently-random numbers), then extended: a `toggleMilestone` mutation (closing the doc's own
previously-named "known gap"), and the two thinnest Goals enriched with additional linked entities.
Dataset now stands at 17 Commitments / 9 Habits / 20 Milestones.

---

## 1. Architecture Review

- ✅ **Shared Kernel Purity:** `DashboardContext`/`Recommendation`, and every new domain type added
  since (`CommitmentPriority`, Goal/Milestone, Habit, Insights context types) live in
  `packages/domain` with no framework imports — spot-checked by reading the files.
- ✅ **Event-sourcing conventions followed for new fields:** `CommitmentPriority` was added as an
  optional constructor param with a safe default (`medium`) plus a dedicated
  `CommitmentPriorityChangedEvent` for updates, mirroring the existing `TaskPriorityChangedEvent`
  pattern rather than overloading the general `edit()`/`EditedEvent` flow — consistent with this
  repo's existing event-sourcing rules.
- 🟡 **Security Check:** N/A — no new PII, storage, or credential handling introduced this pass.

## 2. Product Review

- ✅ **Observed working (this session, 2026-07-14):** all 12 primary screens (Today, Goals ×4
  sub-tabs, Coach, Insights, Profile, Settings ×2, Calendar, dedicated Habits screen) driven by the
  canonical demo dataset were loaded via Playwright against a real running Expo web build, with no
  page errors and content matching the underlying domain data (see Verification Results).
- ✅ **The two visual defects from the v1.0.0 report** (an empty-looking blue card, a stray "‖"
  mark on the dashboard) were **not reproduced** in this pass's Today screenshot — the components
  responsible (`DashboardQuickSummary`) were removed entirely during the amendment-13 work and the
  hero card was rebuilt. Marked resolved-by-supersession rather than root-caused, since the
  original component no longer exists to root-cause.
- ⏳ **New, narrowly-scoped defect found this session:** `/calendar`'s date/weekday header
  (`formatWeekday`/`formatDate` from `@commitment/localization`) renders in English instead of the
  active Spanish locale, but **only** when the URL is loaded cold (direct navigation or hard
  refresh) — confirmed correct via normal in-app navigation (clicking into Calendar from Today). A
  defensive fix (subscribing the component to `i18n.language` via `useTranslation()`) was applied
  but did not resolve the cold-load case; a dual-`i18next`-module-instance cause was investigated
  and ruled out (only one `i18next` module is present in the served bundle). Root cause is still
  open — likely a Metro/Expo-Router hydration-timing interaction specific to this route. Low
  severity: does not reproduce under normal product usage, only on a hard refresh of one deep link.

## 3. UX Review

- ✅ **Theme Adaptability:** all 4 themes were redesigned and visually verified via Playwright this
  cycle (localStorage-seeded theme switch, screenshotted), including the previously-flagged
  `CurrentStreakWidget`/`StreakHighlightInsight` `$warning`-as-decorative-background bug, now fixed.
- ✅ **Design Token Exclusivity:** audited and fixed across ~20 files in the Phase 8 pass (see
  Implementation Details above). Not claimed to be 100% exhaustive — this was a targeted audit of
  screens reachable from primary navigation, not a byte-for-byte grep of every token usage.
- 🟡 **Dynamic Assets & Motion:** not audited this pass.
- ✅ **Widget Registry Plugins:** `WidgetRegistry.ts` still exists and is still the mechanism
  `DashboardRenderer` consumes; Today's presentation layer now filters which registered widgets are
  visible by default rather than deleting the registry/engine infrastructure.
- ✅ **Accessibility:** `accessibilityLabel`/`accessibilityRole`/`accessibilityState` added across
  form fields, `FloatingTabBar` (role="tab"/"tablist"), widgets, and settings/profile rows this
  session; touch targets on `WeekdayPicker` brought to 44×44. Not independently audited against a
  formal WCAG checklist — the criteria followed were this repo's own established token/label
  conventions, not a third-party accessibility audit tool.

## 4. Localization Review

- ✅ **i18n coverage (en/es):** all new UI added since the original report includes both `en` and
  `es` keys in the same change (spot-checked across commitments/tasks/common locale files).
- ⚠️ **i18n architecture compliance (Rule 2, declarative-only):** downgraded from this section's
  original ✅ after discovering `docs/ARCHITECTURE_OVERVIEW.md` §11 post-v2.0.0 — 26 Feature files
  call `useTranslation()`/`t()` directly, violating the documented "Features never call `t()`"
  rule. Coverage (en/es present) is not the same as architectural compliance; see `TECH_DEBT.md`
  Item 3.
- ✅ **i18n reactivity infrastructure fixed:** 6 design-system components were reading translations
  via an imperative `t()` import instead of the reactive `useTranslation()` hook, meaning they
  never re-rendered on a language change. Fixed, plus a Metro config fix for a `react-i18next`
  dual-module-instance hazard (`dist/commonjs/` wasn't matched by the existing CJS/ESM redirect
  logic) that was the actual root cause of components silently rendering empty/stale text.
- ⏳ **See §2** — the Calendar cold-load date-formatting bug is a residual, narrower instance of
  this same class of issue (imperative `i18next.language` read vs. a hook subscription), not fully
  resolved.

## 5. Performance Review

- 🟡 **Render and Bundle Budget:** not measured this pass either. The engine layers added since
  (Insights, Coach recommendation, Habit recurrence) follow the same pure/deterministic pattern as
  the original dashboard engine, which is a positive signal but not a substitute for measurement.

## 6. Platform Review

- 🟡 **Offline Readiness:** not evaluated.
- ✅ **State Management Purity:** the "single boundary hook reads Zustand/React Query" convention
  (`useDashboardContext`, and its equivalents `useInsightsContext`, `useDayAgenda`, etc.) was
  followed consistently across every new engine-backed feature added this session — spot-checked by
  reading each hook's file header/contents.
- ✅ **Dependency integrity of the dev environment:** during this session's verification, the local
  pnpm store was found to have a corrupted package (`escape-string-regexp@4.0.0` — present as a
  directory but missing `package.json`/`index.js`), which broke the entire Expo web bundle
  (`UnableToResolveError` on every route, not specific to any one screen). This was an environment
  issue, not a code defect — `pnpm install --force` repaired it. Noted here because it fully blocked
  running the app until fixed, and a fresh clone/`pnpm install` elsewhere could hit the same
  corrupted-cache class of issue depending on the local pnpm store's state; it is not something this
  repo's code can guard against.

## 7. Quality Review

### Technical Debt Log

Tracked in the repo's canonical registers, not duplicated here — `TECH_DEBT.md` and
`RISK_REGISTER.md` predate this report and were not discovered until after v2.0.0 was written (see
the discrepancy note below). Items registered there as a direct result of this report's work:
`HeroCardStrategy` cleanup, the fixed `__DEV__` dashboard-engine failures, the Calendar cold-load
i18n bug, the 2 pre-existing backend `tsc` errors, the missing-`index.ts`/stray-`" 2"`-file
incident, and the unaudited-accessibility/Feature-Independence gap. `RISK_REGISTER.md` also now
tracks the iCloud Desktop sync corruption hazard discovered while committing this work.

**Governance-critical-fact update:** the "218 files uncommitted" blocker above is now resolved —
this work is committed as `1a3f598` (code) and `7853f22` (governance).

**New discrepancy found after this report's v2.0.0 was written, not yet resolved:** this report's
§4 (Localization Review) claimed ✅ for "i18n & Localization SDK" without checking
`docs/ARCHITECTURE_OVERVIEW.md` §11's Rule 2 (Features must never call `t()` directly, only pass
`i18nKey` to Design System components) — that document was not read before this report's v2.0.0
was written. Verified: 26 files violate this, including `calendar.tsx`, edited during this same
session. Registered as `TECH_DEBT.md` Item 3 rather than silently corrected here — see that
document for full detail and the open architectural question (Rule 2 may need a documented
exception for cases like `Stack.Screen`'s `title` prop, which cannot accept a component-level
`i18nKey`).

- ✅ **API Contract & Evolution:** the one new API surface change (`CommitmentPriority` on
  register/edit Commitment DTOs) is additive and optional with a safe default — non-breaking.
- 🟡 **Feature Independence:** not audited at the source level this pass — see `TECH_DEBT.md` Item 7.

---

## Verification Results (this session, 2026-07-14)

- **`packages/domain`:** 191/191 tests passing (14 suites).
- **`apps/backend`:** 74/74 tests passing (15 suites — confirmed to be the full backend suite).
- **`packages/design-system`:** 56/56 tests passing (13 suites, 40 snapshots).
- **`apps/mobile` dashboard engine:** 41/41 tests passing (2 suites) — up from 10/21 in the v1.0.0
  report; the `__DEV__` issue documented there is fixed.
- **`apps/mobile` insights engine:** 37/37 tests passing (4 suites).
- **Total: 399 tests passing, 0 failing**, across every suite run this session.
- **Typecheck:** `apps/mobile` clean. `packages/theme-engine`, `packages/localization`,
  `packages/design-system` all clean. `apps/backend` has 2 pre-existing baseline errors in
  untouched test files (documented in the Technical Debt table; not attributable to this session's
  changes; tests pass at runtime regardless).
- **Playwright walkthrough:** 12/12 primary screens loaded successfully in demo mode against a live
  Expo web build, populated with real (demo-seeded) data, zero page errors. One narrow, low-severity
  defect found (Calendar cold-load date formatting, §2/§4) and one environment issue found and fixed
  (corrupted pnpm store, §6).
- **Linting:** not independently re-run this session as a standalone full-project pass; relies on
  `lint-staged` at commit time as in the prior report, which — per the governance-critical-fact
  above — hasn't happened yet for any of this session's changes.

---

## What Would Be Needed to Mark VS-031 `Closed`

Reassessed against the v1.0.0 report's own checklist:

1. ~~Root-cause/fix the two visual defects~~ — **resolved by supersession** (§2).
2. ~~Fix the `__DEV__` test failures~~ — **fixed** (§7).
3. ~~UX/Theme Adaptability pass across all Experience Themes~~ — **done**, all 4 themes (§3).
4. ~~Decision on whether Block A is the entirety of scope~~ — **answered**: no, scope grew
   substantially past both the original slice and the 2026-07-13 amendment (see Scope amendment II).

All four of the previous blockers are now resolved.

5. ~~Nothing is committed~~ — **resolved**: committed as `1a3f598` (code) and `7853f22`
   (governance) on 2026-07-14.

Remaining open items:

6. A product/architecture decision on how to name-and-scope this retroactively (is this still one
   sprint, "VS-031," or does the 2026-07-14 amendment's work deserve its own sprint numbers per
   ADR-016 Rule 2?) is still open and cannot be made by this report alone.
7. `walkthrough.md` (the onboarding walkthrough doc) is severely out of date — it still describes
   the mobile client as Flutter and only covers Sprint 0/1. This predates this entire session's
   work and is flagged here as a known governance gap rather than silently left inconsistent or
   risked being rewritten inaccurately under time pressure.
8. No task file exists under `engineering/tasks/` for VS-031 or any of the amendment work (only one
   old `TASK-001` file exists in that directory) — noted as a pre-existing pattern gap, not a new
   convention invented for this report.
9. **New (found after v2.0.0):** a systemic architecture-compliance gap — 26 Feature files violate
   `docs/ARCHITECTURE_OVERVIEW.md`'s i18n Rule 2 (declarative-only translation). Registered as
   `TECH_DEBT.md` Item 3. Whether this blocks `Closed` is itself a product/architecture call: the
   feature works correctly today, but the architecture document that defines this project's own
   quality bar is being violated at scale, silently, by design work done in this same sprint.

### Recommendation

Mark VS-031 **`Completed`**, which now holds unconditionally — the code exists, runs, is committed,
and is verified per the results above. Do **not** mark it `Closed` until items 6, 7, 8, and
(arguably) 9 above get an explicit product/governance decision — none of these are things a
verification pass can decide unilaterally.

---

## 📜 Change History

- **v2.2.0 (2026-07-14):** Discovered `ARCHITECTURE.md`, `TECH_DEBT.md`, and `RISK_REGISTER.md`
  already exist at the repo root (were never read in this report's earlier versions). Produced a
  discrepancy report against `docs/ARCHITECTURE_OVERVIEW.md`: a 26-file systemic violation of i18n
  Rule 2 (declarative-only translation), a possibly-false SQLite/Offline-First "Active" claim, and
  missing coverage of the Habit/Goal/Insights/Coach/Calendar engines. Migrated this report's
  Technical Debt Log into the canonical `TECH_DEBT.md`/`RISK_REGISTER.md` instead of duplicating.
  Downgraded §4's i18n claim from unconditional ✅ given the Rule 2 finding. Noted the 218
  uncommitted files from v2.1.0 are now committed (`1a3f598`, `7853f22`).
- **v2.1.0 (2026-07-14):** Pre-commit inspection of `git status` (per user request to proceed with
  committing) found 3 files existing on disk only under a stray `" 2"`-suffixed name, with their
  correctly-named counterpart missing — including `packages/domain/src/index.ts`, the domain
  package's entire export surface. Fixed by renaming; re-verified 191+74+41+37 tests still passing
  and `tsc` clean across domain/backend/mobile. Also removed accidental debug screenshot PNGs and
  a stale duplicate `package.json` from the working tree before staging. Noted as an open question
  why earlier jest runs this same session didn't surface the missing `index.ts`.
- **v2.0.0 (2026-07-14):** Major rewrite. Documented the substantial scope grown past the
  2026-07-13 amendment (Habits, Goals/Milestones, Insights, Commitment Priority, Theme Engine
  redesign, Coach, navigation/accessibility pass, demo dataset). Re-ran full verification suite
  (399 tests passing, up from 21), re-did the Playwright walkthrough (12 screens), resolved 4 of
  the 4 previous "what would be needed to Close" blockers, found 1 new low-severity bug (Calendar
  cold-load i18n) and 1 environment issue (corrupted pnpm store, fixed in-session). Flagged that
  none of this work is committed as the primary remaining blocker, and that `walkthrough.md`
  remains stale and out of scope for this report to fix.
- **v1.0.0 (2026-07-12):** Initial Completion Report, generated per
  `engineering/governance/roadmap_reconciliation_2026Q3.md` §7 and ADR-015. Documents observed
  code only — no frozen specification existed to compare against.
