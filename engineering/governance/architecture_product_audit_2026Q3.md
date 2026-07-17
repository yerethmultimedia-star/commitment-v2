# Architecture & Product Audit Report (Pre-VS-032 Stabilization)

Version: 1.3.0
Status: Draft
Owner: Architecture Review Board
Date: 2026-07-15

---

## Purpose and scope

Per explicit direction (2026-07-15): before generating high-level architecture documents (Product
Capability Map, Bounded Context Map, Dependency Roadmap), verify that everything implemented
through VS-031 actually meets the architecture and product-experience bar this project holds
itself to. This is a stabilization checkpoint, not a feature-adding pass. Three parallel audits ran
against the running app and the committed codebase (`1a3f598`, `7853f22`, `7cdf6cf`):

1. **Product Review** — all primary screens, visual/UX consistency.
2. **Architecture Review** — DDD/CQRS/bounded-context compliance for the 5 verticals built this
   session (Calendar, Habits, Coach, Goals, Insights).
3. **i18n Review** — real scope of the Rule 2 (declarative-only translation) violation, with
   authorization to refactor if reasonable.

Per the governing instructions for this pass: findings are documented and classified
Critical/High/Medium/Low; fixes are proposed, not applied, **except** where explicitly authorized
(i18n refactor) or where a fix is trivial and directly blocks the audit itself. Every item below
that isn't already marked "Fixed" is a proposal awaiting a go/no-go decision, not a task in
progress.

---

## 1. Product Review

Method: Playwright walkthrough of the running Expo web build (demo mode) across 17 screens/routes
— Today, Goals (4 sub-tabs), Calendar, Habits, Coach, Insights (overview + Focus detail), Tasks,
Profile, Settings (hub + Appearance + Language), Commitment/Habit create forms — plus targeted code
reads and repo-wide greps for duplicated components.

### Critical

**P1. Invisible submit buttons on the two primary creation flows.**
`CommitmentForm.tsx` and `HabitForm.tsx` import `Button` from raw `tamagui`, not
`@commitment/design-system`. The submit button (`theme="active"`) renders with no visible
background against this app's theme tokens — white-on-white text. A user cannot see where to tap
to save a new Commitment or Habit. Confirmed visually on `/commitments/create` and
`/habits/create`.
_Also tracked as `TECH_DEBT.md` Item 8._ **Proposed fix:** swap to
`@commitment/design-system`'s `Button variant="primary"`, exactly the pattern already proven
correct on `login.tsx` (fixed today as a side effect of the i18n migration, see §3). Not applied —
awaiting go-ahead.

### High

**P2. Systemic duplicated screen titles.** The native Stack header title and the screen body render
identical text. Confirmed in code (not just screenshots): `SettingsScreen.tsx` ("Configuración"
×2), `AppearanceSettingsScreen.tsx` ("Tema" ×2, via raw `<Text>`), `LanguageSettingsScreen.tsx`
("Idioma" ×2), `CreateCommitmentScreen.tsx` ("Crear Compromiso" ×2), `CreateHabitScreen.tsx`
("Nuevo Hábito" ×2). Likely also affects Edit Commitment/Edit Habit (pattern not individually
re-verified there). **One instance fixed 2026-07-15** (Habits UX redesign, not part of the original
count above): `TodayHabitsScreen.tsx` had this exact pattern ("Hábitos de Hoy" in both the Stack
header and a body `<Title>`) — the redesign removed the redundant body title, letting `HabitsHero`'s
own small label carry that context alongside the completion ratio instead of repeating it standalone.
Still open everywhere else listed above. **Proposed fix (remaining instances):** pick one owner for
the heading per screen (drop the body `<Title>` or hide the Stack header) — ideally enforced by
convention in the shared `AppScreen` wrapper rather than patched per-screen.

**P3. No shared `Badge`/`Chip` primitive.** Three independent hand-rolled implementations
(`CommitmentStatusBadge.tsx`, `CommitmentPriorityBadge.tsx`, `shared/ui/web-badge.tsx`). Concrete
consequence: on Goals→Tareas, "Baja" priority renders as plain text while "Media"/"Alta" render as
colored pills. _Also tracked as `TECH_DEBT.md` Item 9._ **Proposed fix:** add a `Badge`/`Chip`
primitive to the Design System, migrate the 3 call sites.

**P4. Tasks screen breaks the app's established interaction language.** Every other list screen
(Today, Goals' 4 sub-tabs, Calendar) uses checkbox taps, a single edit icon, or a card tap. Tasks
instead shows 4 always-visible text buttons per row ("Completar | Editar | Duplicar | Archivar") —
CRUD-table style, contradicting the product's own visual bar (Linear/Notion Calendar/Rise, not
"Material Design demos"), and roughly doubling row height on a screen with 14+ items. **Proposed
fix:** redesign to the established card pattern — checkbox to complete, single overflow affordance
for the rest.

**P5. Pervasive text truncation on Goals→Tareas and Goals→Hábitos.** Many titles ellipsis-cut
mid-word: "Learn conversational Portugu...", "Complete a 30-day fitnes...". Affects a large
fraction of visible rows, not an edge case. **Fixed (verified 2026-07-15)** during the Goals Design
System Adoption pass: primary titles changed `numberOfLines` 1→2 (`GoalCard.tsx`, `HabitsTab.tsx`,
`GoalTasksTab.tsx`); a second, related truncation not originally cited here was also found and fixed
live — the Habits sub-tab's secondary "linked goal" caption was rendering as `"Improv..."` for
"Improving Physical Health" because it shared a no-wrap row with recurrence/time text; fixed with
`flexWrap="wrap"` on that row. Verified via Playwright screenshots on both Sunrise and Midnight
themes — no more mid-word ellipsis on any visible row.

### Medium

**P6.** Horizontal-scroll content with no scroll affordance: Insights' time-range tabs cut off at
the viewport edge ("Trimestre (Pr…"); the Appearance theme-picker carousel shows a 3rd card cut off
with no dots/fade/arrow hint. **Proposed fix:** add a fade-edge or dot indicator to both.

**P7.** Unclear Profile vs. Settings boundary — Profile has its own settings-adjacent rows
(Preferencias, Notificaciones, Modo Demo dev toggle) unreachable from the dedicated Settings hub,
which today only exposes Tema/Idioma. **Proposed fix:** decide one canonical home for
account/app-level settings and cross-link or consolidate.

**P8.** Ad-hoc typography in ~17 files using raw `<Text fontSize="$6/7/8" fontWeight="bold">`
instead of `<Title>`. Some are legitimately large stat numbers (fine as-is); others
(`AppearanceSettingsScreen.tsx` and likely siblings) act as page headings and should be `<Title>`.
**Proposed fix:** audit the 17, convert the page-heading subset.

**P9. Bounded-context smell** (cross-referenced with the Architecture Review, §2): generic
`ControlledInput`/`ControlledSelect`/`ControlledDatePicker` live under
`features/commitments/components/forms/` and get cross-imported by `HabitForm.tsx`. _Also tracked
as `TECH_DEBT.md` Item 11._

**P10.** Calendar cold-load i18n bug reconfirmed present live (English date/weekday on cold
`/calendar` load). Not new — already `TECH_DEBT.md` Item 4, no change in status.

### Low

**P11.** Coach screen's header "+" button — purpose unclear from a visual pass alone; confirm
intent matches the same affordance's use elsewhere (likely global Quick Capture).

**P12.** Insights' week-over-week deltas are uniformly red for any negative value — correct for
today's 4 metrics, worth confirming it doesn't invert if a "lower is better" metric is ever added.

**P13.** Calendar's agenda list mixes two row sub-patterns (timed dot+time vs. untimed dot+duration)
— intentional given the data model, creates mild visual unevenness.

**P14.** Toggle switches on Appearance/Accessibility ("Reducir movimiento", "Alto contraste") look
under-styled relative to the rest of the app's interactive elements — not confirmed as a bug, worth
a closer look.

**P15.** Profile's Notifications row uses ad-hoc `fontSize="$4"` instead of a default semantic size.

### 4-question UX test (What now? Why? Progress? Next?)

Fully passes: **Today, Coach, Insights** (overview + Focus detail).
Partially fails: **Tasks** (no "why it matters" — no goal linkage shown in list view; no progress
framing). **Calendar** shows a static agenda with no explicit "what's next" framing. **Goals**
sub-tabs are browse/manage screens by nature (arguably exempt from this test).

---

## 2. Architecture Review

Method: read `docs/ARCHITECTURE_OVERVIEW.md` for the documented rules, then audited domain purity,
event-sourcing compliance, CQRS handler cleanliness, layer boundaries, engine reuse, and
repository-pattern compliance for Calendar, Habits, Coach, Goals, Insights.

**Overall assessment: better than expected.** Several anticipated problems (handler-level business
logic, demo-mode leakage into components, framework contamination in domain code) are not present.

### High

**A1. Goal aggregate has no backend module.** `packages/domain/src/goal/` is a full Aggregate Root
(own events, own repository interface) but `apps/backend/src/` has no `goal/` module — the gap is
honestly self-documented in-code (`goal.repository.ts`, `goals.api.ts`) but not reflected in
governance docs, which use "first-class root" language without qualification. Calendar/Insights/
Coach having no backend module is correct by design (aggregations/rules engines, not aggregates).
_Also tracked as `TECH_DEBT.md` Item 10._ **Proposed fix:** scope a Goal backend CQRS module in a
future sprint, mirroring Habit's (see A3 below); until then, qualify "first-class root" claims in
product-facing docs.

### Positive findings (no action needed, noted for the record)

**A2.** `CoachRecommendationProvider` and the Insights `engine/` are pure, framework-free
TypeScript living in `apps/mobile`, not `packages/domain` — consistent with the precedent already
set by the original (committed) `RuleRecommendationProvider`. This is a deliberate, consistent
convention (assembly/recommendation logic over domain data → mobile-local engine; domain-invariant
computation like streaks/progress/due-today → `packages/domain/*/engine/`) that isn't written down
anywhere. **Recommendation:** document this split explicitly in `docs/ARCHITECTURE_OVERVIEW.md`'s
Key Decisions table so it doesn't get relitigated per-vertical.

**A3.** Habit's CQRS handlers (`enable`/`disable`/`archive`/`complete`) are clean thin orchestrators
— idempotency lives correctly inside the aggregate, not the handler, which is exactly the fix
`TECH_DEBT.md`'s existing TD-003 (Commitment's Activate/Pause handlers) still needs. **Recommend
using Habit's handlers as the reference pattern when TD-003 is eventually addressed.**

**A4.** Habit aggregate's event-sourcing is correctly implemented — all mutators call
`recordEvent()`, state changes only through `applyEvent()`.

**A5.** Calendar's domain engine imports Habit's read models/pure functions directly (`HabitSummary`,
`isHabitDueOn`) — a cross-bounded-context dependency, but read-only and semantically necessary
given Calendar's inherently cross-cutting purpose. **Low severity**, worth watching: would become
High severity if Calendar ever reached into another context's aggregate _methods_ rather than just
read models/pure functions.

**A6.** `Goal.linkCommitment()` references Commitment only via its `CommitmentId` Value Object,
never the full aggregate — standard, correct DDD foreign-reference pattern.

**A7.** Demo Mode / Repository pattern is correctly implemented with no violations — every
`*/api/*.ts` file checks `isDemoModeActive()` exactly once at the boundary; the only other
`isDemoMode` reference outside `*/api/` is Profile's own demo-mode toggle control, not a bypass.

**A8.** `TECH_DEBT.md` Items 4-7 independently re-verified as still accurate; no severity revisions.
TD-003 (Commitment handlers) not re-checked — out of this pass's 5-vertical scope, status unchanged.

**A9.** `docs/ARCHITECTURE_OVERVIEW.md` §5's claim of "100% strict coverage" for `packages/domain`
was not measured in this pass (would require running coverage tooling) — flagged as unverified,
not confirmed or denied. Low severity, documentation-accuracy risk only.

---

## 3. i18n Review (Rule 2 — declarative-only translation)

Method: full re-derivation of the violation list (the original `TECH_DEBT.md` Item 3 count was
wrong — see below), classification of every site, and authorized refactor where reasonable.

**Critical process finding: original scope was undercounted by more than half.**
`TECH_DEBT.md`'s original count (26 files) came from `grep "useTranslation()"` — empty parens only,
which misses every `useTranslation('namespace')` call. Corrected count: **64 files**. This is
itself worth internalizing: a technical debt estimate silently understated its own scope by 59%
because of an imprecise search pattern, and that inaccurate number had already been cited in the
Completion Report and this project's governance docs before this audit caught it.

**Work done (authorized — "if the refactor is reasonable, do it"):**

- 11 files migrated to declarative `i18nKey` props.
- Root-cause capability gaps closed rather than worked around: `ControlledInput`/
  `ControlledDatePicker`/`ControlledSelect` gained `labelI18nKey`/`placeholderI18nKey`/
  `accessibilityHintI18nKey`; `EmptyState`/`ErrorState` gained `titleI18nKey`/`descriptionI18nKey`/
  `messageI18nKey`/`retryLabelI18nKey`; design-system `Card` gained `accessibilityLabelI18nKey`/
  `accessibilityLabelI18nParams`.
- Verified independently (not just trusting the migration's own report): `apps/mobile` tsc clean,
  `@commitment/design-system` jest 56/56 passing, no regressions.
- Incidental fix: `login.tsx`'s raw-Tamagui `Button` was replaced with the Design System `Button`
  as part of its migration — this is the exact same fix P1/`TECH_DEBT.md` Item 8 proposes for
  `CommitmentForm.tsx`/`HabitForm.tsx`, now proven correct in production code, not just proposed.

**Remaining scope:** ~53 files (15 from the original 26 not yet touched, 38 newly found). The new
capability layer makes most of this mechanical going forward — recommend a dedicated follow-up
pass rather than treating it as done.

**Two genuine architectural limitations identified — proposed for an ADR, not yet created:**

1. React Navigation route `options` fields read outside the render cycle (`Stack.Screen` `title`,
   `headerBackTitle`, `tabBarLabel`) cannot accept a component-level `i18nKey` — confirmed across 4
   files. Note: `options.headerRight` (a function) already works fine with a declarative
   `i18nKey`-based `<Button>` — only the plain-string fields are actually blocked. Proposed
   exception wording is recorded in `TECH_DEBT.md` Item 3.
2. `ThemePreviewCard.tsx` intentionally avoids Design System components on its preview surface to
   escape the ambient Tamagui theme context (each card previews a _different_ theme than the
   active one) — a DS component there would reintroduce the exact bug the component exists to
   prevent. Needs its own narrow exception.

Full detail in `TECH_DEBT.md` Item 3 (updated 2026-07-15).

---

## Consolidated findings by severity

| #                  | Finding                                           | Area                 | Status                                                                              |
| :----------------- | :------------------------------------------------ | :------------------- | :---------------------------------------------------------------------------------- |
| P1 / TD-8          | Invisible submit buttons (Commitment/Habit forms) | Product              | **Fixed — verified 2026-07-15**                                                     |
| P2                 | Duplicated screen titles (5+ screens)             | Product              | High — proposed, still open                                                         |
| P3 / TD-9          | No Badge/Chip primitive                           | Product              | **Fixed — verified 2026-07-15** (2/3 call sites; 3rd is now dead code, not deleted) |
| P4                 | Tasks screen interaction pattern mismatch         | Product              | High — proposed, still open                                                         |
| P5                 | Text truncation on Goals sub-tabs                 | Product              | **Fixed — verified 2026-07-15**                                                     |
| A1 / TD-10         | Goal aggregate has no backend module              | Architecture         | High — proposed, still open                                                         |
| i18n scope         | Rule 2 miscounted (26 actual 64)                  | i18n / Process       | **Fixed (count), partially fixed (11/64 files)**                                    |
| P6                 | Horizontal scroll with no affordance              | Product              | Medium — proposed                                                                   |
| P7                 | Profile/Settings boundary unclear                 | Product              | Medium — proposed                                                                   |
| P8                 | Ad-hoc typography (~17 files)                     | Product              | Medium — proposed                                                                   |
| P9 / TD-11         | Form controls in wrong bounded context            | Product/Architecture | Medium — proposed                                                                   |
| P10 / TD-4         | Calendar cold-load i18n bug                       | Product              | Medium — unchanged, still open                                                      |
| i18n remaining     | ~53 files still violate Rule 2                    | i18n                 | Medium-High — proposed follow-up                                                    |
| P11-P15            | Minor UX/visual nitpicks                          | Product              | Low — proposed                                                                      |
| A2, A5, A9         | Undocumented conventions / unmeasured claims      | Architecture         | Low — informational                                                                 |
| A3, A4, A6, A7, A8 | —                                                 | Architecture         | Positive findings, no action needed                                                 |

---

## Recommendations (in priority order)

1. ~~**Fix P1/TD-8 immediately**~~ — **Done.** Verified 2026-07-15 (see `TECH_DEBT.md` Item 8
   change history v1.14.0): both forms already use the Design System `Button`. Landed incidentally
   during the Design System Adoption phase, not as a dedicated fix for this recommendation — but the
   end state matches it exactly.
2. Decide the two i18n Rule 2 ADR exceptions (§3) so the remaining ~53-file migration isn't blocked
   on an open architectural question.
3. ~~Schedule the Badge/Chip primitive (P3/TD-9)~~ — **Mostly done** (see `TECH_DEBT.md` Item 9):
   primitive built, 2 of 3 call sites migrated, Baja-priority bug fixed. Remaining: delete the
   now-dead `shared/ui/web-badge.tsx`. Tasks screen redesign (P4) still open.
4. Scope the Goal backend module (A1/TD-10) as a VS-032+ candidate, not urgent but structurally
   important before Goal-dependent features multiply further. Still open.
5. The remaining Medium/Low items are reasonable to batch into a future polish pass — none are
   blocking.

## Suggested next phase

With this stabilization pass complete and its findings documented (not yet all fixed), the
originally-planned next phase — Product Capability Map, Bounded Context Map, Dependency Roadmap —
can proceed. Recommend those documents explicitly incorporate this report's findings (especially
A1's Goal/backend gap and A2's undocumented engine-placement convention) rather than describing an
idealized architecture that doesn't yet match reality.

---

## 📜 Change History

- **v1.3.0 (2026-07-15):** One P2 instance fixed during the Habits UX redesign
  (`TodayHabitsScreen.tsx`) — found live, not part of the original 5-screen count; still open on the
  originally-named screens.
- **v1.2.0 (2026-07-15):** P5 (Goals text truncation) fixed and verified during the Goals Design
  System Adoption pass — see `TECH_DEBT.md` v1.15.0 for full evidence. Original High-severity count
  is now 3 of 5 open (P2, P4, A1/TD-10).
- **v1.1.0 (2026-07-15):** Verification pass (requested before closing the TD-015 stabilization
  mini-phase and reporting sprint status): confirmed against actual code, not restated from memory.
  P1/TD-8 (the report's sole Critical) and P3/TD-9 (High) are both fixed — landed incidentally
  during the Design System Adoption phase's screen migrations, undocumented until now. P2, P4, P5,
  and A1/TD-10 verified still open (checked live against current code, not assumed unchanged).
  Severity count is now 0 Critical, 4 of 5 original High still open. See `TECH_DEBT.md` v1.14.0 for
  full evidence.
- **v1.0.0 (2026-07-15):** Initial Architecture & Product Audit Report — Product Review (17
  screens), Architecture Review (5 verticals), and i18n Rule 2 review (scope-corrected 26→64,
  partial refactor) run in parallel. 24 findings documented, 1 Critical, 5 High, 6 Medium, 5 Low,
  plus 5 positive architecture findings.
