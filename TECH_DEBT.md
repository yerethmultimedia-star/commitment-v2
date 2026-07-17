# Technical Debt Register

Version: 1.32.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-16

---

This document tracks identified technical debt, compilation warnings, and architectural compromises, outlining their impact, priority, and recommended resolution steps.

---

## Active Technical Debt Item 3: Systemic violation of i18n Rule 2 (declarative-only translation)

- **Description:** `docs/ARCHITECTURE_OVERVIEW.md` §11 Rule 2 states Features must never call `t()`
  directly and must instead pass `i18nKey` props to Design System components. Original scope
  estimate (2026-07-14) was **26 files**, based on `grep "useTranslation()"` — that pattern only
  matches empty-parens calls and silently missed every `useTranslation('namespace')` call.
  Corrected scope (2026-07-15, full audit): **64 files**.
- **Progress (2026-07-15):** 11 files migrated to declarative `i18nKey` props. Root-cause capability
  gaps closed along the way rather than worked around per-file: `ControlledInput`/
  `ControlledDatePicker`/`ControlledSelect` gained `labelI18nKey`/`placeholderI18nKey`/
  `accessibilityHintI18nKey`; `EmptyState`/`ErrorState` gained `titleI18nKey`/`descriptionI18nKey`/
  `messageI18nKey`/`retryLabelI18nKey`; design-system `Card` gained `accessibilityLabelI18nKey`/
  `accessibilityLabelI18nParams`. Verified: `apps/mobile` tsc clean, design-system jest 56/56
  passing, no regressions.
- **Remaining scope:** ~53 files (15 from the original 26 not yet touched, plus 38 found only by
  the corrected grep). The new capabilities above make most of these mechanical, not novel work.
- **Impact:** Architecture-principle violation, not (currently) a functional bug — translations
  work correctly. The risk is drift: without the declarative-only discipline, nothing prevents a
  future edit from introducing an untranslated string or a component that doesn't re-render on
  language change (see Item 4, Calendar's `formatWeekday`/`formatDate`, the exact class of bug this
  rule exists to prevent).
- **Confirmed genuine architectural limitations — formalized as ADR-018 (2026-07-15):**
  1. Expo Router route `options` fields read outside the render/reconciliation cycle (`Stack.Screen`
     `title`, `headerBackTitle`, `tabBarLabel`) cannot accept a component-level `i18nKey` prop —
     confirmed across `calendar.tsx`, `EditCommitmentScreen.tsx`, `CommitmentWorkspaceScreen.tsx`,
     `TodayHabitsScreen.tsx`. `options.headerRight` (a function, not a plain string) already works
     fine with a declarative `<Button i18nKey=.../>` — proving only the plain-string fields are
     blocked. Exception condition: the component must use the reactive `useTranslation()` hook
     (never an imperative `t` import) so the value still updates on language change.
  2. `ThemePreviewCard.tsx` deliberately avoids Design System components on its preview surface to
     escape the ambient Tamagui theme context (each card previews a _different_ theme than the
     active one) — using a DS component there would silently reintroduce the exact bug this
     component exists to avoid.
  - See `docs/03-architecture/adr_018_i18n_rule2_exceptions.md` for the full decision record and
    the test any future exception claim must pass.
- **Priority:** Medium-High, unchanged. Recommend finishing the remaining ~53 files as a dedicated
  follow-up pass now that the capability layer and the ADR-018 exception boundary both exist.
- **Recommended Resolution:** Complete the remaining ~53-file migration using the now-available
  `i18nKey`-family props; anything matching ADR-018's two categories is resolved, not pending.

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
- **Update (2026-07-15):** A distinct, more concrete bug under this same umbrella was found and
  fixed: on web, Tamagui's own renderer (not react-native-web) has no accessibility-prop-to-ARIA
  translation layer — `accessibilityLabel`/`accessibilityHint`/`accessibilityRole`/`accessibilityState`
  passed to any Tamagui primitive landed raw on the DOM as unrecognized attributes (a React warning
  per prop, per render, on nearly every screen). Fixed with one centralized helper,
  `toPlatformAccessibilityProps()` (`packages/design-system/src/accessibility/platformAccessibilityProps.ts`,
  exported from the package root) — native is a pass-through, web maps to `aria-*`/`role` and drops
  `accessibilityHint` (no reliable ARIA equivalent). Applied to all Design System base components
  that render a Tamagui primitive with accessibility props (`Card`, `Surface`, `Button`, `IconButton`,
  `Badge`, `StatusIndicator`, `FeedbackState`, `Input`, `TextArea`, `Switch`, `SectionPrimitive`,
  `TextBase` — the last covers `Title`/`Body`/`Label`/`Caption`/`Headline`), plus ~25 `apps/mobile`
  call sites found passing these props directly to a raw Tamagui element instead of through a Design
  System component (`FloatingTabBar`, dashboard widgets, Goals/Habits/Tasks/Insights/Appearance
  screens, shared form controls). Verified via Playwright across Today/Coach/Calendar/Goals (list +
  workspace)/Tasks/Insights/Profile/Appearance: console is clean of these warnings, DOM has zero
  offending nodes. This closes the specific leak; the formal WCAG AA audit itself remains open.

---

## Active Technical Debt Item 8: Invisible submit buttons on the two primary creation flows

- **Description:** `CommitmentForm.tsx` and `HabitForm.tsx` both `import { Button } from 'tamagui'`
  (raw Tamagui, not `@commitment/design-system`). The submit button (`theme="active"`) renders with
  no visible background against this app's custom theme tokens — white/near-invisible text
  floating on the page. Confirmed visually on `/commitments/create` ("Guardar Compromiso") and
  `/habits/create` ("Crear Hábito"). Found by the 2026-07-15 Product Review audit. The exact same
  bug pattern was already fixed on `login.tsx` this same day (raw Tamagui `Button` →
  `@commitment/design-system` `Button variant="primary"`) as an incidental side effect of the i18n
  Rule 2 migration (Item 3) — proving the fix is known-good, just not yet applied here.
- **Impact:** **Critical.** A user cannot see where to tap to save a new Commitment or Habit — the
  two most fundamental "create new X" actions in the product.
- **Priority:** ~~Critical~~ **Fixed** (verified 2026-07-15). Found already resolved during a
  status-verification pass, not fixed in that pass — confirmed via direct code read, not assumed:
  both `CommitmentForm.tsx` and `HabitForm.tsx` import `Button` from `@commitment/design-system`
  (not raw Tamagui) and render it with `variant="primary" size="large"`, matching the recommended
  resolution and the `login.tsx` pattern this item cites as known-good. This landed as an incidental
  side effect of the broader Design System Adoption phase's screen migrations (uncommitted working
  tree as of 2026-07-15) rather than as a dedicated tracked fix — no change history entry exists for
  it prior to this one, which is why it went undetected until this verification pass.
- **Recommended Resolution:** ~~Swap to `@commitment/design-system`'s `Button` with
  `variant="primary"` in both files~~ — done. No further action.

---

## Active Technical Debt Item 9: No shared Badge/Chip primitive in the Design System

- **Description:** Three independent hand-rolled badge implementations exist:
  `CommitmentStatusBadge.tsx`, `CommitmentPriorityBadge.tsx`, `shared/ui/web-badge.tsx`. No shared
  `Badge`/`Chip` component in `packages/design-system`. Consequence visible in production: on
  Goals→Tareas, "Baja" priority renders as plain gray text while "Media"/"Alta" render as colored
  pills, because there's no shared primitive enforcing one visual rule. Found by the 2026-07-15
  Product Review audit.
- **Impact:** Visual inconsistency, and a growing maintenance surface (a 4th ad-hoc badge is likely
  the next time a similar need arises, e.g. Habit recurrence tags or Goal category chips).
- **Priority:** ~~High~~ **Fixed** (verified 2026-07-15), found already resolved during a
  status-verification pass, same circumstances as Item 8 (incidental to the Design System Adoption
  phase, no dedicated change history entry existed for it before now). Confirmed via code:
  `packages/design-system/src/components/Badge.tsx` exists (`BadgeTone` incl. `neutral`/`danger`/
  `warning`/etc.); `CommitmentStatusBadge.tsx` and `CommitmentPriorityBadge.tsx` both import it and
  map their domain enums to tones (`low`→`neutral`). The specific Baja-priority bug is fixed too —
  `neutral` tone still renders a bordered pill (`showBorder = variant === 'outlined' || tone ===
'neutral'`, `$surfaceRaised` background), not plain text.
  - **Not fully closed:** `shared/ui/web-badge.tsx`, the third hand-rolled implementation this item
    names, was never migrated or deleted — confirmed via repo-wide grep, it now has zero import
    references anywhere in `apps/mobile`. It's dead code, not a live inconsistency; flagged here
    rather than deleted, since removing unrelated dead code wasn't the scope of this pass.
- **Recommended Resolution:** ~~Add a `Badge`/`Chip` primitive..., migrate the 3 existing call
  sites~~ — 2 of 3 done. Remaining: delete the now-unused `shared/ui/web-badge.tsx`.

---

## Active Technical Debt Item 10: Goal aggregate has no backend module

- **Description:** `packages/domain/src/goal/` is a full Aggregate Root with its own domain events
  (`GoalRegisteredEvent`, `GoalArchivedEvent`, etc.) and a `GoalRepository` interface — but
  `apps/backend/src/` has no `goal/` module at all. `goal.repository.ts` and
  `apps/mobile/src/features/goals/api/goals.api.ts` both self-document this gap in their own code
  comments ("Interface only — no backend implementation yet" / "routes to the in-memory demo
  repository regardless of Demo Mode"). Found by the 2026-07-15 Architecture Review audit.
  Calendar/Insights/Coach having no backend module is architecturally correct (they're read-only
  aggregations/rules engines, not aggregates of their own) — Goal is different, it was built to be
  persisted and can't be.
- **Impact:** Any product-facing claim that "Goal is a first-class aggregate root" needs qualifying
  with "demo/mobile-only until a backend module ships" — governance docs currently don't make this
  distinction. Not a bug (the gap is honestly commented in-code), but a real capability gap.
- **Priority:** High.
- **Recommended Resolution:** Scope a Goal backend CQRS module (mirroring Habit's, which this same
  audit found to be a clean reference implementation) as part of a future sprint. Not started.

---

## Active Technical Debt Item 11: Generic form controls live under a Commitment-specific bounded context

- **Status: Fixed (2026-07-15).** `ControlledInput`/`ControlledSelect`/`ControlledDatePicker` moved
  from `features/commitments/components/forms/` to `apps/mobile/src/shared/forms/`. Both
  `CommitmentForm.tsx` and `HabitForm.tsx` updated to import from the new shared location. Verified:
  `apps/mobile` tsc clean, no other call sites referenced the old path.
- **Description (historical):** These were generic, not Commitment-specific, but lived under
  `features/commitments/components/forms/` and got cross-imported by `HabitForm.tsx` (a different
  bounded context). Found by the 2026-07-15 Product Review audit.
- **Impact (historical):** Low-to-medium — worked correctly, but the import direction (Habits
  reaching into Commitments' folder) was backwards from a bounded-context-isolation standpoint.

---

## Active Technical Debt Item 12: Freeze `Card`'s public surface (`CardProps extends YStackProps`)

- **Description:** `Card.tsx`'s props type extends the full `YStackProps` from Tamagui, so any
  caller can pass arbitrary layout/style props (`padding="$7"`, `borderRadius="$9"`,
  `shadowOpacity={0.3}`, etc.) straight through — the component compiles and accepts it, silently
  overriding the fixed `padding="$4"`/`borderRadius="$4"` defaults, because the prop spread
  (`{...props}`) is applied after those defaults in the render. Found during the Card audit
  requested ahead of building the metric-primitives family (2026-07-15) — no critical defect, Card
  works correctly today; the risk is architectural drift as more Features reach for the escape
  hatch instead of a controlled API, the same way `MetricCard` itself used `padding="$3"` via this
  exact mechanism.
- **Impact:** Currently low (nothing is visibly broken) but compounds over time — every ad-hoc
  `padding`/`borderRadius`/`shadowOpacity` override erodes the "one visual language" goal this
  Design System consolidation effort exists for. Not urgent, but cheaper to fix before dozens of
  screens depend on the current unrestricted surface than after.
- **Priority:** Medium-High (raised 2026-07-15, still deliberately not Critical/High — no
  user-facing defect exists — but the escape hatch is more likely to generate silent visual debt
  before it ever produces a functional bug, so it shouldn't sit at the same priority as purely
  cosmetic gaps).
- **Recommended Resolution:** In a future version, `CardProps` stops extending `YStackProps` and
  instead exposes only controlled props — proposed starting point: `variant`, `padding` (enum, not
  raw token), `interactive`, `selected`, `loading`, `disabled`, `header`, `footer`, `actions`, and
  an explicit `contentProps` escape hatch only if a real need justifies it (not by default). Not
  started — do not implement until a second/third consumer's real needs are known, per the same
  reasoning `ProgressMetric`'s `circular`/`linear` split (see the design note in
  `ProgressMetric.tsx`) is deferred rather than pre-guessed.

---

## Active Technical Debt Item 13: Duplicate Feedback-state components (`apps/mobile/shared/ui/feedback/` vs. `@commitment/design-system`)

- **Description:** Found while building the Feedback Primitives family (2026-07-15).
  `packages/design-system/src/components/EmptyState.tsx` was itself an orphaned, stale
  implementation — raw Tamagui `Text`, no `i18nKey` support, only used by
  `DashboardEmptyState.tsx`. Meanwhile `apps/mobile/src/shared/ui/feedback/{EmptyState,ErrorState,
LoadingState}.tsx` — a _different_, more i18n-compliant `EmptyState`/`ErrorState` pair plus a
  standalone `LoadingState` — are what the other 9+ screens (Calendar, Coach, Tasks, Goals'
  sub-tabs, Habits) actually import. Two components with the same name, different files, different
  capabilities, both live.
- **Fixed as part of this item:** the design-system's own `EmptyState.tsx` was replaced with a
  proper implementation (composing the new `FeedbackState` base, alongside new `LoadingState`/
  `ErrorState` siblings), and its one real consumer (`DashboardEmptyState.tsx`) updated to match —
  this also fixed a pre-existing Rule 2 violation there (`t()` called imperatively) as a small,
  in-scope side effect.
- **Not fixed — deliberately deferred:** `apps/mobile/src/shared/ui/feedback/*.tsx` and their 9+
  call sites still exist untouched. Migrating those imports to `@commitment/design-system`'s new
  `EmptyState`/`ErrorState`/`LoadingState` is exactly the kind of "screen adoption" work explicitly
  scheduled for the next phase (Today → Goals → Habits → Calendar → Coach → Insights → Profile →
  Appearance), not something to fold into "building a primitive."
- **Impact:** Low today (both work correctly, independently) — but until the 9+ call sites migrate,
  two parallel "the app's empty state" components exist, and a future edit to one won't be reflected
  in the other.
- **Priority:** Medium — tracked here so the upcoming adoption phase has a concrete checklist item,
  not rediscovered from scratch.
- **Recommended Resolution:** during the screen-adoption phase, migrate each of the 9+ call sites
  from `@/shared/ui/feedback/{EmptyState,ErrorState}` to `@commitment/design-system`, then delete
  `apps/mobile/src/shared/ui/feedback/{EmptyState,ErrorState,LoadingState}.tsx`.
- **Progress:** `coach.tsx` migrated (2026-07-15). `insights.tsx`, `GoalProgressInsight.tsx`,
  `FocusDetailScreen.tsx` migrated (2026-07-16, Insights capability pass — `LoadingState`/
  `ErrorState`/`EmptyState` all now from `@commitment/design-system`). Remaining: Calendar, Tasks,
  Goals' sub-tabs, Habits, and whichever others surface as each screen is adopted — full list not
  re-verified per-screen until each is actually visited.

---

## Active Technical Debt Item 14: `packages/design-system` snapshot tests never actually exercise per-theme output

- **Description:** Found while root-causing the "Tamagui missing token `$color`" console warning
  (2026-07-15). `src/components/__tests__/setup.tsx`'s `renderWithTheme(ui, theme)` accepts
  `'sunrise' | 'midnight' | 'forest'` (lowercase) and passes it straight to
  `<TamaguiProvider defaultTheme={theme}>`. The real theme registry keys
  (`packages/design-system/src/tokens/themes.ts`) are capitalized — `Sunrise`, `Midnight`, `Forest`,
  `DefaultLight`. A lowercase name matches none of them, so Tamagui silently falls back to its
  first-registered theme (`light` → this app's `DefaultLight` palette) regardless of which theme
  name the test asked for. Confirmed by inspecting every `.snap` file under
  `src/components/__tests__/__snapshots__/`: every resolved color across every "sunrise"/"midnight"/
  "forest"-labeled snapshot is `DefaultLight`'s value (`#18181F`, `#6B6B76`, `#6C4EFF`, etc.) — none
  of Sunrise's `#271F15`/Midnight's `#FAFAFA`/Forest's `#14281A` ever appear anywhere in the suite.
  This was invisible until now because the `$color`/`$borderColor` token gap (see the theme-adapter
  fix in this same change) meant no component ever actually resolved a `color` value in test
  snapshots at all — the wrong-theme bug had nothing to show up in.
- **Impact:** Every "matches sunrise/midnight/forest theme snapshot" test across the whole
  `@commitment/design-system` suite has been asserting the same (`DefaultLight`) output under three
  different labels since these tests were written. They currently provide zero coverage of
  theme-to-theme visual differences, despite appearing to.
- **Priority:** ~~Medium~~ **Fixed** — raised to High and closed same-day per explicit review
  feedback (correctly judged more serious than a cosmetic gap: it meant the design-system's entire
  multi-theme visual regression coverage was an illusion).
- **Resolution (2026-07-15):** `renderWithTheme` now maps the lowercase, readable param
  (`'sunrise'`/`'midnight'`/`'forest'`/`'defaultLight'`) to the real capitalized registry key before
  passing it to `TamaguiProvider`'s `defaultTheme` — zero call-site changes needed across the suite.
  All 59 affected snapshots regenerated; spot-checked several against each theme's actual hex values
  (e.g. `IconButton`'s icon color: Sunrise `#271F15`, Midnight `#FAFAFA`, Forest `#14281A` — all now
  distinct and each matching its theme file, where every one previously read `#18181F`,
  DefaultLight's value, regardless of label). 203/203 tests passing.

---

## Active Technical Debt Item 15: No interactive element in the app is reachable via keyboard Tab (web)

- **Description:** Found during Calendar's accessibility review (2026-07-15, keyboard-navigation
  checklist item). Every pressable element this app renders on web — DS `Button`, `IconButton`,
  `Card`(`clickable`), the tab bar, day-selector pills — resolves to a bare `<div role="button">`
  with **no `tabindex` attribute**. Confirmed via direct DOM inspection (not inference): dumped
  every `[role="button"]` element's attributes on both the new Calendar screen and the
  already-shipped, already-approved Coach screen — identical result on both, `tabindex: null` on
  100% of them, including the plain `Agregar actividad` / add-recommendation `Button`. A `<div>`
  with a `role` but no `tabindex` is **not** in the browser's default tab order — `role="button"`
  alone does not grant focusability, only the correct ARIA semantics once focused. Confirmed
  independent of the accessibility-prop-mapping fix earlier this session (`toPlatformAccessibilityProps`
  correctly emits `role`/`aria-*` — this is a _different_ gap, adjacent but not overlapping: getting
  the ARIA role right doesn't matter if the element can never receive focus in the first place).
- **Impact:** **High.** No mouse-free user can operate this app's web build at all today — not "some
  screens," literally every interactive element on every screen checked so far (Coach, Calendar).
  This is a full keyboard-accessibility failure, not a screen-specific gap.
- **Priority:** High — flagged, not fixed, in this change. Per this session's explicit process
  (architectural changes to the Design System's shared interaction layer are a stop-and-report
  trigger, not something to push through silently mid-screen-checkpoint), this needs its own
  dedicated fix pass — almost certainly in `packages/design-system/src/interaction/` (`FocusRing.tsx`,
  `useInteractionState.ts`, or wherever `onPress`/`focusable` ultimately map to DOM attributes) —
  the same "single point of adaptation" shape as the `toPlatformAccessibilityProps` fix, not a
  per-component patch.
- **Priority:** ~~High~~ **Fixed** (2026-07-15), same day, after an RCA per explicit review request.
- **Root cause, confirmed via Tamagui source (not inferred):** `@tamagui/web`'s `createComponent.mjs`
  picks the rendered HTML tag from a per-instance `render` prop (`const renderProp = props.render`);
  with no `render`, everything falls back to Tamagui's default `View` → `<div>`. Tamagui's own
  specialized primitives already solve this for themselves — `@tamagui/button`'s `Button`
  (`render: jsx('button', {type:'button'})`, `tabIndex: 0`), `@tamagui/switch`'s `Switch`
  (`render: 'button'`), `@tamagui/select`'s `SelectTrigger` (`render: 'button'`) — confirmed via
  live DOM inspection that all three already render as real, tabbable `<button>` elements. This
  Design System's own `Button`/`IconButton`/`Card`/`Surface` never adopted that mechanism — they
  import plain `View` and never pass `render`, so they get Tamagui's default `<div>` with `role`
  ARIA sugar layered on top by `toPlatformAccessibilityProps` (correct semantics, zero focusability).
  Confirmed `tabIndex` alone would not have been sufficient either — no generic Tamagui layer wires
  Enter/Space activation for an arbitrary focusable `<div>` (only Tamagui's own specialized
  interactive primitives implement that themselves, individually).
- **Resolution:** new `packages/design-system/src/accessibility/resolveInteractiveElement.ts` — a
  "Platform Semantic Element Resolver" mapping `accessibilityRole` → the correct native element
  (`button`/`checkbox`/`switch`/`tab` → `<button>`; `link` → `<a>`, not yet wired since this helper
  has no `href` input and no caller uses it today; `menuitem`/`treeitem`/`option` deliberately left
  unmapped — those belong to roving-tabindex composite widgets, a `<button>` would be actively wrong
  there; structural roles like `text`/`header` unmapped). `toPlatformAccessibilityProps()` (the same
  single point of adaptation as the earlier accessibility-prop fix) now calls this resolver and adds
  `render`/`tabIndex: 0` on web only, never for a `disabled` element — **zero changes to any
  component or screen**, since every affected call site already spreads this function's output.
  Native impact: none, verified in Tamagui's own source
  (`createComponent.native.js:285`: `isWeb` is `false` in the native build, so `renderProp` is never
  read at all — not a `Platform.OS` branch of our own, decided by Tamagui itself) and empirically
  (0 of 214 design-system snapshot tests changed, since they run under the native jest preset).
- **Verification:** 6 new unit tests for the resolver + 5 functional tests for the helper's web
  branch (`render`/`tabIndex`/disabled-state assertions, not snapshots) — 214/214 passing. Live
  keyboard-only Playwright pass (zero mouse interactions) against the running app: DS `Button`,
  `IconButton`, `Card` (clickable), and `FloatingTabBar` all confirmed `<BUTTON>`, Tab-reachable,
  Enter- and Space-activated, with real navigation resulting (e.g. Enter on a Calendar habit item →
  `/habits/h-01/edit`). `Surface` verified by code-identity with `Card` (same exact pattern) — no
  live consumer exists yet to click through. Console clean, 0 new warnings, 0 regressions.
- **Incidental finding (separate, not part of this fix):** the Calendar screen's "Agregar actividad"
  button doesn't open `QuickCaptureDialog` at all — confirmed identical for mouse click and keyboard
  (not a keyboard regression). Root cause: `QuickCaptureDialog` is only mounted inside
  `app/(tabs)/_layout.tsx`, but `/calendar` (`app/calendar.tsx`) lives outside the `(tabs)` route
  group, so nothing is mounted to react to `openQuickCapture('calendar')`'s store update while on
  that screen. Not fixed here — flagged for whoever owns Calendar's remaining polish.
- **Follow-up regression #1, found and fixed same day (reported by review):** rendering real
  `<button>` elements made `TodayAgendaWidget.tsx`'s "Ver todo" text — which had its own
  `onPress`/`accessibilityRole="button"` nested _inside_ the widget's already-`clickable` `Card`,
  both pointing at `/calendar` — invalid HTML (`<button>` cannot contain `<button>`; React logs a
  hydration-error warning for it). Before this fix both were harmless nested `<div>`s. Fixed by
  removing the inner text's redundant interactive semantics (it's now purely visual, styled the
  same, since the whole Card already handles the tap). Audited all 8 `clickable`/`selectable` `Card`
  usages app-wide for the same nested-interactive pattern — this was the only instance.
- **Follow-up regression #2, found and fixed same day (reported by review):** a real `<button>` also
  picks up the browser's native UA chrome (gray border, background, padding, default `appearance`)
  — this app never imported `@tamagui/core/reset.css`, Tamagui's own first-party stylesheet for
  exactly this (`button, input, select, ... { all: unset }`), because nothing rendered as a real
  HTML control before this fix existed to need it. **Root cause confirmed by grep, not assumed**:
  zero references to `reset.css` anywhere in `apps/mobile`. Fixed with a single side-effect import
  in `app/_layout.tsx` (`import '@tamagui/core/reset.css'`) — Metro/Expo resolves `.css` imports
  web-only and no-ops them on native automatically, the same per-platform split `render` itself
  already relies on, not a `Platform.OS` branch of our own.
  - **That reset also strips the browser's native focus outline** (`button { outline: none }`,
    intentional on Tamagui's part — its own primitives supply their own `focusVisibleStyle` instead).
    This Design System's own components (`Card`, `Button`, `IconButton`, `Surface`) already have a
    visible indicator via their own `<FocusRing>` wrapper and were unaffected. Every _raw_
    `View`/`XStack`/`YStack` + `onPress` elsewhere in the app (`TodayHabitsWidget` rows,
    `FloatingTabBar` tabs, Calendar's day-strip, etc.) was never wrapped in `<FocusRing>` — verified
    live that these had **zero** visible focus indicator after the reset, a real WCAG 2.4.7 Focus
    Visible regression (worse than before this fix existed: previously unfocusable, now focusable
    but invisible-when-focused). Fixed from the same shared `toPlatformAccessibilityProps()` point of
    adaptation — added `focusVisibleStyle: { outlineColor: '$focus', outlineStyle: 'solid',
outlineWidth: 2, outlineOffset: 2 }`, using Tamagui's own pseudo-style prop mechanism (the exact
    same one `@tamagui/button`'s own primitive uses internally for this purpose, confirmed via its
    source — not a bespoke CSS rule). DS components now get this in addition to their own
    `<FocusRing>` — a harmless, purely additive visual doubling, not corrected for (fixing it would
    mean this shared helper needing to know which callers have their own `FocusRing`, which defeats
    being the one shared point of adaptation).
  - **Verified live** (Playwright, not assumed): rest-state `borderWidth: 0px` / `appearance: none`
    on Today, Calendar, Goals, and Profile (no more gray UA border); focus-visible outline
    (`rgba(108, 78, 255, 0.4)`, 2px solid, matching `FocusRing`'s own color) now appears on Tab-focus
    for both DS components and raw app-level elements; still a real `<button>`; Enter/Space still
    activate; console clean on all 4 routes. 216/216 design-system tests passing (2 new tests added
    for `focusVisibleStyle`), 0 snapshot changes (native still unaffected).

---

## Active Technical Debt Item 16: `apps/mobile` Jest environment has no `__DEV__` global

- **Description:** Found during the Goals Design System Adoption pass (2026-07-15) while running the
  full mobile test suite as part of standard verification — not related to any Goals change.
  `src/features/dashboard/engine/layout/__tests__/DashboardLayoutEngine.test.ts` fails 14/14 tests
  with `ReferenceError: __DEV__ is not defined`, thrown from
  `assertDeterministic.ts:23` (`if (!__DEV__) return;`). `__DEV__` is a React Native global normally
  injected by the Metro/Jest-Expo preset; this suite's jest environment doesn't provide it. Confirmed
  pre-existing and unrelated to this session: the file has no working-tree changes (`git status`
  clean on it) and no Goals code touches `DashboardLayoutEngine`.
- **Impact:** Medium. 14 tests in this one suite give zero signal (they error before running any
  assertion) — `DashboardLayoutEngine`'s own correctness is currently untested in CI/local runs
  despite the file existing and looking green in a stale run. Confined to this one suite; the other
  5 mobile suites (78 tests total app-wide) pass.
- **Priority:** Medium — not blocking (all 5 other suites and every design-system suite pass; nothing
  in Goals depends on this file). Logged, not fixed, per the Working Agreement's "log High/Medium and
  continue" rule for the adoption phase.
- **Recommended Resolution:** Add `__DEV__` to the jest environment globals (`jest.config.js`'s
  `globals`, or via the `jest-expo` preset setup if it's supposed to supply this and isn't being
  picked up) — likely a jest config drift, not an application bug.

---

## Active Technical Debt Item 17: `GoalProgressBar`/`CircularProgress` migration — Insights still pending

- **Description:** Follow-up from the Goals Design System Adoption pass (2026-07-15). Goals'
  `GoalCard.tsx` and `GoalWorkspaceScreen.tsx` migrated from the local `GoalProgressBar.tsx`/
  `CircularProgress.tsx` to the shared `@commitment/design-system` `ProgressMetric` (linear/circular
  variants) — exactly the "Fase B" migration `ProgressMetric.tsx`'s own doc comment already named as
  deferred. `CircularProgress.tsx` had no other consumers and was deleted. `GoalProgressBar.tsx` was
  **not** deleted — `apps/mobile/src/features/insights/ui/components/GoalProgressInsight.tsx` (not
  yet in scope, Insights is later in the VS-032 queue) still imports it.
- **Impact:** Low. Purely a follow-up checklist item, not a live inconsistency — `GoalProgressBar` and
  `ProgressMetric` render equivalently today.
- **Priority:** Low — do during the Insights adoption pass, not now (out of scope per the Working
  Agreement; don't touch screens ahead of their turn in the queue).
- **Recommended Resolution:** When adopting Insights, swap `GoalProgressInsight.tsx` to
  `ProgressMetric` the same way, then delete `GoalProgressBar.tsx`.
- **Related fix, already applied (not deferred):** while migrating, found `ProgressMetric` itself
  had no accessibility semantics at all — unlike the two components it replaces, which both exposed
  `accessibilityRole="progressbar"` + `aria-value*`. This is a WCAG-relevant regression risk for
  _every_ `ProgressMetric` consumer (Goals now, and the pre-existing Dashboard/Today `DashboardHeroCard`
  usage), not a Goals-only concern — per the Working Agreement, WCAG AA gaps are a fix-now trigger,
  not a log-and-continue one. Fixed directly in `packages/design-system/src/components/ProgressMetric.tsx`
  (both circular and linear branches) using the same `toPlatformAccessibilityProps()` single point of
  adaptation the rest of the Design System already uses — not a new component, not a new pattern.
  Verified live via Playwright: `aria-valuenow`/`aria-valuemin`/`aria-valuemax` now present and
  numerically correct on all 5 Goals-list progress bars, the Goal Workspace ring, and Today's
  `DashboardHeroCard` ring (50%, unchanged visually, 0 console errors). 3 design-system snapshot
  tests updated to include the new props (expected diff, not a regression); full design-system suite
  (29 suites / 219 tests) and mobile `tsc --noEmit` both clean afterward.

---

## Active Technical Debt Item 18: ~~Habit↔Goal linkage is create-only-in-theory, unreachable in practice~~ — Fixed 2026-07-15

- **Description:** Found during the Habits capability audit (2026-07-15) — checking "Goals linkage"
  as part of the new Feature Completeness checklist, not assumed working because the data model
  supports it. `HabitSummary`/`CreateHabitPayload`/domain all support a `goalId` field, and
  `GoalWorkspaceScreen`/`HabitsTab` correctly _display_ a habit's linked goal. But nothing lets a
  user _set_ that link:
  1. `HabitForm.tsx` has no goal-picker field at all — `goalId` is threaded through
     `CreateHabitScreen`/`EditHabitScreen`'s default values but never rendered as a control.
  2. The only navigation entry point to `/habits/create` (`GoalsScreen.tsx`'s FAB) passes no
     `goalId` route param, and the route (`app/habits/create.tsx`) doesn't read one — so even a
     contextual "add habit to this goal" flow doesn't exist to fall back on.
  3. `EditHabitPayload` (both the mobile API type and the demo repository) **doesn't include
     `goalId` at all** — confirmed by reading the interface, not assumed — so even if a picker
     existed, editing/re-linking an existing habit's goal isn't supported at the payload level.
- **Impact:** High (Product). A habit's Goal linkage is effectively read-only/accidental — it can
  only exist if pre-seeded in demo data. A real user can never link a new habit to a goal, or
  change an existing habit's goal, through any UI path in the app today.
- **Priority:** High — **UX decision made (2026-07-15), implementation still deferred.** User chose
  the hybrid approach rather than picking one of the two options this item originally posed:
  (1) `HabitForm` gets an optional Goal-select field, available on every create/edit flow — not
  contextual-only. (2) `GoalWorkspaceScreen` additionally gets an "Add Habit" action that opens the
  same form with `goalId` pre-filled via a route param. Both paths write through the same form, no
  duplicated logic. Deliberately not implemented this session — the Habits UX redesign (Apple
  Clock/Timers-inspired hero + card rework) takes priority first; this stays deferred debt with its
  design already decided, not an open question anymore.
- **Recommended Resolution:** Add a `ControlledSelect` field to `HabitForm.tsx` fed by `useGoals()`
  (matching its existing field patterns), wire `GoalWorkspaceScreen`'s new "Add Habit" action to
  `router.push('/habits/create?goalId=...')` with the route reading that param, and add `goalId` to
  `EditHabitPayload` (mobile API type + demo repository + backend `edit-habit` command/handler) so
  re-linking an existing habit works too, not just initial creation.
- **Resolution, implemented 2026-07-15 (product decision: Goal linkage is opt-in for Habits, not
  assumed):**
  - **Domain:** new `Habit.relinkGoal(goalId: string | null, now: Date)` method + dedicated
    `HabitRelinkedToGoalEvent` — not folded into `edit()`, matching the aggregate's existing granular
    style (`postpone()`/`enable()`/`archive()` are each their own method). No-ops if unchanged;
    blocked on an archived habit like every other mutation. 5 new domain tests.
  - **Backend CQRS:** `RelinkHabitGoalCommand` + handler + `PATCH /habits/:id/goal` (accepts
    `{goalId: string | null}`, `null` required explicitly — omitting the field is a validation
    error, not "leave unchanged") + a new `HabitRelinkedToGoalProjector` updating the read model.
  - **Mobile:** `habitsApi.relinkGoal()` + `demoHabitsRepository.relinkGoal()` +
    `useRelinkHabitGoal()` hook. `HabitForm` gained a "Relacionado con" picker (`ControlledSelect`,
    "Ninguno" as the default/first option) — extended `ControlledSelect`'s options to accept a
    pre-resolved `label` alongside `labelKey` (same label-vs-i18nKey shape `MetricCard`/`Badge`
    already use), since Goal titles are dynamic content, not translatable strings. `EditHabitScreen`
    now fires `relinkGoal` after the regular edit save when the goal changed — **sequentially, not
    via `Promise.all`**: found live that both mutations do an unlocked read-modify-write on the same
    demo-mode record, and running them concurrently caused a real lost-update bug (whichever
    `replace()` landed second silently discarded the other's change). `GoalWorkspaceScreen`'s
    Hábitos section gained a "+" action wired to `/habits/create?goalId=<goal.id>`, which
    `CreateHabitScreen` reads to pre-fill the picker (still user-changeable).
  - **Demo dataset:** added `h-10` ("Take vitamins"), deliberately goal-independent — the existing
    9 seeds all had a `goalId`, so the independent-habit path had never actually been exercised.
    `DEMO_DATASET.md` updated (entity table, "17 Commitments and all 9 Habits are accounted for"
    language, Rule 4).
  - **New regression test:** `apps/mobile/src/core/demo/__tests__/demo-habits.repository.test.ts`
    guards the sequential-write fix directly (the exact `edit()` then `relinkGoal()` pattern
    `EditHabitScreen` now uses).
  - **Verified:** domain 197/197, backend 74/74 (2 pre-existing unrelated type errors in test files,
    documented separately — see Item 6), mobile 66/80 (same 14 pre-existing `__DEV__` failures, +2
    new passing tests), `tsc --noEmit` clean across domain/backend/mobile. Playwright: picker shows
    the correct current state for both a goal-linked habit and a goal-independent one, all 4 themes,
    keyboard (Enter opens the select, focus lands on an option), Coach/Insights/Calendar/Today all
    render `h-10` correctly with no crashes.
  - **Not fixed (flagged, out of scope):** whether the _real_ backend's versioned repository has
    true optimistic-concurrency protection against the same class of concurrent-write race the demo
    repository just exhibited — it has a version counter (`in-memory-habit.repository.ts`) but this
    session didn't audit whether it actually rejects stale writes. Worth checking before assuming
    the backend is immune to what the demo repository wasn't.

---

## Active Technical Debt Item 19: Shared form controls (`shared/forms/*`) don't source from the Design System

- **Description:** Found during the Habits capability audit while reviewing `HabitForm.tsx`.
  `ControlledInput.tsx`, `ControlledSelect.tsx`, and `ControlledDatePicker.tsx` (used by Habits
  _and_ Commitments _and_ Tasks — cross-feature, confirmed via grep) all render with raw Tamagui
  `Input`/`Text`/`Select`/`Button` internally, not `@commitment/design-system`'s `Input`/`Label`
  components. They're already correctly themed (semantic tokens throughout, e.g.
  `$contentSecondary`/`$danger`/`$divider`/`$accent`) and already accessible
  (`toPlatformAccessibilityProps` applied) — this is a sourcing/consistency gap, not a visible bug
  or a11y gap.
- **Impact:** Low-Medium. No visible inconsistency today; the risk is drift if the Design System's
  `Input`/`Select` primitives evolve (new focus states, new validation styling) and these three
  shared wrappers silently don't inherit it since they don't route through those components.
- **Priority:** Medium — not fixed here. Cross-feature (affects Commitments and Tasks, not just
  Habits) — out of scope for a single capability's adoption pass per the Working Agreement, and
  risky to change without testing every consumer. Also: this doesn't fail the "genuinely removes
  duplication or increases consistency" bar on its own, since nothing currently looks or behaves
  inconsistently — logged for awareness, not because it's urgent.
- **Recommended Resolution:** Revisit when doing a dedicated Design System hardening pass, not
  during a single feature's capability adoption — swap the internals of these three files to
  `@commitment/design-system`'s `Input`/`Select` primitives, verify all consumers (Commitments,
  Habits, Tasks forms) unchanged visually.
- **Related, smaller finding (same file family, not registered separately):** `HabitForm.tsx`'s
  inline `DayOfMonthField` hand-rolls its own label/`Input`/error rendering instead of reusing
  `ControlledInput`, because it needs custom digit-only parsing + 1–31 clamping that
  `ControlledInput`'s API has no hook for today. Low priority, same "don't extend a cross-feature
  shared component's API for one caller" reasoning as above.

---

## Active Technical Debt Item 20: Every Portal-rendered modal ignores the active theme (Midnight/Forest/Sunrise)

- **Description:** Found 2026-07-15 while verifying the redesigned `PostponeSheet` (built on
  `BottomSheet`) across all 4 themes — the first time any `ModalPrimitive`-based component
  (`Dialog`, `BottomSheet`, `ConfirmationDialog`, `ActionSheet` all share this one implementation)
  was screenshotted in a non-default theme via Playwright. On web, `ModalPrimitive` renders through
  `Portal` (`packages/design-system/src/portal/Portal.tsx`), which mounts its content into a
  separate root outside the app's themed component tree. The modal's own `backgroundColor="$surface"`
  and its children's semantic-token colors all resolve against whatever theme context that separate
  root has (apparently the default/light one), not the user's actual active theme — confirmed live:
  a `Midnight`-themed screen behind the sheet renders correctly dark, the sheet itself renders fully
  light regardless of theme.
- **Impact:** High. Affects every dialog/sheet in the app on web, in every non-default theme — not
  new, not caused by this session's work (`Dialog` uses the identical `ModalPrimitive`+`Portal`
  mechanism `BottomSheet` does, confirmed by reading both source files). Purely undetected until now
  because no prior verification pass screenshotted a modal specifically in Midnight/Forest/Sunrise.
  Not a WCAG contrast failure (the sheet's own text is still readable, black-on-white) — a visual
  theme-consistency break, jarring but not unreadable.
- **Priority:** High — flagged, not fixed. Root-causing and fixing `Portal`'s theme propagation is an
  architecture-level fix affecting every modal consumer app-wide, out of scope for a single
  component's redesign pass.
- **Recommended Resolution:** Whoever owns the Portal/Theme integration should wrap `Portal`'s mount
  root in the same Tamagui `<Theme name={...}>` provider the main app tree uses (reading the current
  theme from the same store `AppearanceProvider` already reads), rather than letting portaled content
  fall back to Tamagui's default theme resolution.
- **Interim workaround pattern, first used 2026-07-16:** `TasksScreen.tsx`'s FAB (moved into
  `<Portal>` to fix a stacking-context bug, see "Resolved Issues" below) manually re-wraps its own
  portaled content in `<Theme name={themeId}>`, reading `themeId` from `useAppearanceStore` directly
  at the call site — correct, but easy to forget on the next `<Portal>` consumer, since nothing
  enforces it. **Not building a shared wrapper yet** (one consumer doesn't justify the abstraction),
  but per user direction: if a second or third floating element (context menu, another overlay,
  a future FAB elsewhere) needs `<Portal>`, extract a `ThemedPortal` (`<Portal><Theme name={themeId}>
{children}</Theme></Portal>`) into the design system instead of copying the manual rewrap again —
  that would also make this item's real fix (Portal itself reading the active theme) a one-file
  change instead of an app-wide search-and-replace later.

---

## Active Technical Debt Item 21: ~~Global scroll regression~~ — Fixed (P1/Critical, full RCA)

- **Description:** User-reported 2026-07-15, classified P1/Critical: after the `PostponeSheet`
  redesign (Item 20's neighbor), no screen in the app scrolled. Full RCA performed before any fix,
  per explicit instruction not to trial-and-error:
  - **Root cause:** `PostponeSheet.tsx` switched from `Dialog` to `BottomSheet`. `BottomSheet`
    branches by platform (`packages/design-system/src/modal/BottomSheet.tsx`) — web uses
    `ModalPrimitive` (unaffected), native uses `BottomSheetAdapter`, which wraps
    `@gorhom/bottom-sheet`. This was the **first usage of `BottomSheet` anywhere in the app**
    (confirmed: zero prior consumers). `@gorhom/bottom-sheet`'s own `package.json` declares
    `react-native-gesture-handler >=2.16.1` as a required peer dependency, and the library requires
    the app root to be wrapped in `<GestureHandlerRootView>` to correctly arbitrate its gestures
    against React Native's native touch responder system. **Confirmed via repo-wide grep:
    `GestureHandlerRootView` did not exist anywhere in the codebase** — a pre-existing, latent gap,
    harmless until something actually engaged RNGH. `BottomSheetAdapter.tsx` (pre-existing, not
    written this session) mounts `<GorhomBottomSheet index={open ? 0 : -1}>` **unconditionally** —
    its gesture system activates as soon as a screen containing `PostponeSheet` renders, not only
    when the sheet is opened.
  - **Evidence:** peer-dependency check on the installed `@gorhom/bottom-sheet` package; repo-wide
    grep for `GestureHandlerRootView` (0 results); confirmed via this session's own file history that
    no other shared file (`AppScreen`, `ScreenScroll`, `Portal`, `PortalProvider`) was touched; live
    Playwright scroll test (real `mouse.wheel`, not `fullPage` screenshots — those bypass real scroll
    gestures via CDP and would never have caught this) confirmed scroll **did** work on web across
    Today/Coach/Calendar/Goals/Habits even before the fix — consistent with the root cause being
    native-only (web never engages `@gorhom/bottom-sheet`/RNGH via `BottomSheet`).
  - **Real scope:** native (iOS/Android) only, most likely — not reproducible on web by construction.
  - **Fix applied:** wrapped the app root (`apps/mobile/src/app/_layout.tsx`) in
    `<GestureHandlerRootView style={{flex:1}}>`, outermost provider. This is the library's own
    documented integration requirement, not a workaround — no `scrollEnabled`, no
    `pointerEvents="none"`, nothing reverted.
  - **Risk:** Low — additive wrapper, matches the library's standard usage pattern, no-ops safely on
    web.
- **Verification:** `tsc --noEmit` clean. Live Playwright scroll test (real wheel events, `scrollTop`
  measured directly) across all 9 requested screens post-fix: Today, Coach, Calendar, Goals, Habits,
  Tasks, Insights, Profile all scroll correctly (`maxScrollTop > 0`); Appearance shows `0` but
  confirmed via direct DOM measurement (`scrollHeight === clientHeight`, `best: null` for any
  overflowing element) that it has no scrollable content at that viewport — not a bug.
  `PostponeSheet`/`DurationWheelPicker` re-verified functional after the fix (opens, tap-to-select
  still works, 0 console errors). Design-system 30/30 suites, mobile jest 64/78 (same pre-existing,
  unrelated `__DEV__` failures).
  - **Honest limitation:** this session has no iOS Simulator/Android emulator access (confirmed
    earlier: `xcrun simctl` unavailable in this environment) — the native-side symptom itself
    (device/simulator scroll behavior) was not directly re-observed after the fix, only inferred from
    (a) the RCA's fully-evidenced causal chain and (b) applying the library's own documented,
    standard fix. If the regression is still visible on a real device/simulator after this fix,
    that's a signal the root cause has a second contributing factor not yet found — re-open this item
    rather than assume the fix is incomplete.

---

## Active Technical Debt Item 22: ~~Task↔Goal linkage unreachable + "Priority of the day" locked to Commitment-only tasks~~ — Fixed 2026-07-15

- **Description:** VS-032 Fase 2 (Task/Priority consolidation). Investigated the user's premise that
  Today's "Priority Task" duplicates a parallel entity — **found this false**: `DashboardPriorityTask`
  was already a view-model projection over a real Task, and the Hero already navigated to the same
  `TasksScreen`/`TaskForm` used everywhere else. The real gaps, found by reading the code:
  1. `Task` (domain/backend) already had a direct `goalId` field, separate from `commitmentId` —
     but zero mobile wiring existed (no field on `TaskModel`, no picker in `TaskForm`).
  2. `TaskForm.tsx`'s Commitment picker only rendered in create mode (`{!task && (...)}`) — editing
     an existing task could never change its Commitment link, a gap not caught by the original audit.
  3. `computePriorityTask()` (`useDashboardContext.ts`) was hard-locked to the top active Commitment's
     tasks — a task linked only to a Goal, or fully independent, could never win Today's hero
     regardless of urgency.
  4. `GoalWorkspaceScreen.tsx`'s `linkedTasks` only matched via `commitmentId` — a Goal-direct task
     was invisible to its own Goal Workspace.
- **Impact:** High (Product). Same class of gap as Item 18 (Habit↔Goal), but for Task, plus a second,
  independent gap in the "Priority of the day" selection algorithm favoring Commitment-linked work
  unconditionally.
- **Resolution, implemented 2026-07-15** (design doc:
  `engineering/governance/tasks_goal_optionality_and_priority_consolidation_proposal.md`, approved
  with changes — see v2.0.0 changelog for the 7 corrections applied):
  - **Domain:** `Task.relinkGoal()` + `Task.relinkCommitment()`, each a dedicated method + event
    (`TaskRelinkedToGoalEvent`/`TaskRelinkedToCommitmentEvent`), mirroring Habit's pattern. **New
    invariant not present on Habit:** linking one clears the other — a Task's Goal and Commitment
    links are mutually exclusive on the record itself (a Commitment's own Goal, if any, is resolved
    for _display_ only, never stored twice). 9 new domain tests.
  - **`DashboardPriorityTask`** gained `contextLabel` (always present — resolved Goal title >
    Commitment title > "Personal" fallback) and optional `goalId`/`goalTitle`; `commitmentId`/
    `commitmentTitle`/`commitmentProgressRatio` became optional. `computePriorityTask()` rewritten
    from a fixed origin hierarchy to **score-based selection**: every pending-today task scores on
    priority + an active-Commitment bonus + an active-Goal-priority bonus (`PRIORITY_TASK_SCORE_WEIGHTS`,
    `useDashboardContext.ts`), highest score wins regardless of origin. A Commitment's Goal only
    contributes its bonus/context when that Commitment is itself active — a task on a cancelled
    Commitment doesn't inherit its Goal's boost (found live while verifying the demo dataset: seed
    `c-15` is Cancelled but its Goal `g-01` is Active, which would have silently mis-scored). This is
    a separate system from the class-based `RecommendationEngine` (widget/Coach recommendations) —
    not merged with it, different responsibility.
  - **Backend CQRS:** `RelinkTaskGoalCommand`/`RelinkTaskCommitmentCommand` + handlers +
    `PATCH /tasks/:id/goal` + `PATCH /tasks/:id/commitment` + two new projectors, mirroring Habit's
    pattern exactly.
  - **Mobile:** `TaskModel` gained `goalId`. `TaskForm.tsx`'s Commitment-only, create-only picker
    replaced with a single "Relacionado con" selector (Ninguno/Objetivo/Compromiso) available in
    **both** create and edit — closing gap #2 above. Edit save fires `relinkGoal`/`relinkCommitment`
    **sequentially** after `edit()`/`changePriority()`, never `Promise.all` (same demo-mode
    concurrent-write lesson as Item 18). `GoalWorkspaceScreen.linkedTasks` now also matches
    `tk.goalId === goalId`; gained an "Agregar tarea" action mirroring "Agregar hábito", wired to
    `/(tabs)/tasks?prefillGoalId=<id>` — `TasksScreen` gained a matching deep-link effect (mirrors its
    existing `taskId` deep-link) that opens `TaskForm` in **create** mode with the Goal preloaded,
    the first real usage of `TaskForm`'s create-mode render path in production code (previously only
    reachable in theory — task creation went exclusively through Quick Capture).
  - **Demo dataset:** added `t-058` ("Book the physical therapy assessment"), Goal-direct (`g-01`),
    no Commitment, high priority, due today — deliberately scores higher (35) than every
    Commitment-linked task due today in the current seed (max 30), so the new selection algorithm has
    a real, visually-verified case of a non-Commitment task winning the Hero, not just algorithmic
    support for it. `DEMO_DATASET.md` updated (entity hierarchy, "10 standalone tasks" language,
    Rule 4).
  - **New regression test:** `apps/mobile/src/core/demo/__tests__/demo-tasks.repository.test.ts` —
    sequential-write fix + both mutual-exclusivity directions, mirroring the Habit test.
  - **Verified:** domain 52/52 (task.spec.ts), backend 74/74 (`tsc --noEmit` clean except the 3
    pre-existing errors tracked under Item 6), mobile `tsc --noEmit` clean, demo repo tests 4/4.
    Playwright (real browser, in-app navigation only — no `page.goto()` mid-flow, per the established
    lesson): Today Hero shows `t-058` with "Improve Physical Health" as context, no progress bar
    (correctly omitted, no Commitment); editing a Commitment-linked task, switching to "Ninguno",
    saving, and reopening the same task confirms the Commitment link was actually cleared (not just
    UI state); Goal Workspace's "Tareas: 8/14" stat confirms `t-058` is counted in `linkedTasks`
    (13 Commitment-derived + 1 Goal-direct = 14, matches the seed exactly).
  - **Not fixed (flagged, found live during verification, out of scope for this item):** see Item 23.

---

## Active Technical Debt Item 23: `GoalWorkspaceScreen`'s "Upcoming" tasks list excludes same-day tasks after midnight

- **Description:** Found live while verifying Item 22 — `upcomingTasks` (`GoalWorkspaceScreen.tsx`)
  filters `linkedTasks` with `tk.dueDate && new Date(tk.dueDate) >= now`. Seed due dates are
  normalized to midnight (`daysFromNow()` in `demo-data.ts`), but `now` is the actual wall-clock
  `new Date()` — so a task due "today" fails this comparison as soon as any time has passed since
  midnight, which in practice is almost always. The task still counts correctly everywhere that reads
  `linkedTasks` directly (e.g. the Resumen tab's Tasks stat), it just never appears in this one
  "Próximamente" list once the day has started.
- **Impact:** Medium. Cosmetic/completeness — the affected list under-reports same-day tasks, but
  no data is lost and no other surface (Today, TasksScreen, the Resumen stat) is affected.
- **Priority:** Medium — pre-existing (predates this session's Task work; would affect any
  Commitment-linked same-day task too, not just the new Goal-direct one), not a regression, not
  blocking. Fix: compare against a midnight-normalized `now` (reuse the `today()` helper's pattern)
  instead of the live wall-clock time, or explicitly include same-day tasks alongside future ones.

---

## Active Technical Debt Item 24: Native navigation headers ignore the active Experience Theme (Midnight/Forest/Sunrise)

- **Description:** Found 2026-07-16 auditing Insights' Focus detail screen under Midnight — the
  screen's own content correctly renders dark (see RI-3 below), but the header bar ("Enfoque", back
  arrow) stays white. Root cause: `apps/mobile/src/app/_layout.tsx` wraps the app in
  `<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>` — React Navigation's
  own theme object, driven by the OS/system light-dark scheme (`useColorScheme()`). It has no
  awareness of `AppearanceProvider`'s custom Experience Theme selection (Midnight/Forest/Sunrise are
  a layer entirely above light/dark), so every screen using `ExpoStack.Screen options={{headerShown:
true}}` gets a header styled for the SYSTEM scheme, not the app's actual active theme. Confirmed
  systemic, not Insights-specific: `GoalWorkspaceScreen` (and by extension every pushed detail
  screen with a header — Commitment Workspace, Edit screens) shows the identical white-header-under-
  Midnight symptom.
- **Impact:** Medium-High. Visually jarring on any non-default theme (a light header bar sitting on
  top of a dark screen) — not a functional break, headers still work, just wrong colors. Affects
  every screen with `headerShown: true`, which is most of the app's "pushed" (non-tab) screens.
- **Priority:** Medium-High — flagged, not fixed. Distinct from Item 20 (Portal/theme) even though
  both are "some rendering surface doesn't see the active theme" — this one is React Navigation's own
  theming system, not Tamagui's Portal, so the fix is different: map `AppearanceProvider`'s resolved
  theme colors into a React Navigation `Theme` object (`{ colors: { card, text, border, ... } }`)
  computed from the same `useResolvedAppearance()`/`useAppearanceStore()` source, instead of the
  binary `colorScheme === 'dark'` check.
- **Recommended Resolution:** whoever owns navigation theming should derive the `<ThemeProvider>`'s
  `value` from the active Experience Theme's resolved semantic colors (background/text/border),
  falling back to system light/dark only if no custom theme is set, rather than the reverse.

---

## Active Technical Debt Item 25: Selected/unselected chip-tab pattern hand-rolled twice (candidate for a shared primitive)

- **Description:** Found 2026-07-16, Insights' Design System audit. `TimeRangeTabs.tsx`
  (Semana/Mes/Trimestre/Año selector) explicitly documents that it copies `ObjectivesTab.tsx`'s raw
  Tamagui `Button` styling for a "selected chip in a row" pattern, because `@commitment/design-system`'s
  `Button` has no "selected" state concept. Two independent, hand-rolled implementations of the same
  interaction pattern now exist.
- **Impact:** Low today (both work correctly) — same shape as Item 13 before it was tracked: low
  impact per-instance, growing maintenance surface as more screens need a segmented/tab selector.
- **Priority:** Low — **not building a shared primitive yet** (per standing guidance: don't extract
  an abstraction for its own sake). Two known consumers already exist, meeting the bar for
  "worth watching." If a third shows up, extract a `ChipTabs`/`SegmentedControl` into the design
  system instead of hand-rolling a third copy.
- **Recommended Resolution:** when justified (3rd consumer), add a `selected`/`value`+`onChange` axis
  to the Button family or a dedicated `SegmentedControl`, then migrate `TimeRangeTabs` and
  `ObjectivesTab` to it.

---

## Active Technical Debt Item 26: Only 1 of Insights' 4 stat cards is interactive, with no visual affordance cue

- **Description:** Found 2026-07-16, Insights UX audit. Of the 4 weekly-summary stat cards
  (Objetivos completados / Tareas completadas / Productividad / Enfoque promedio), only "Enfoque
  promedio" is tappable (`onPress` → Focus detail screen) — the other 3 render identically but do
  nothing on tap. Nothing distinguishes which is which (no chevron, no different hover/press state,
  no icon).
- **Impact:** Medium — breaks a visual expectation (4 identical-looking cards, only 1 interactive) so
  users are unlikely to ever discover the Focus drill-down exists.
- **Priority:** Medium — **explicitly deferred to the Product Polish Sprint**, not fixed now. User's
  own framing: 3 valid resolutions exist and the choice is a product call, not an obvious bug fix —
  (1) make none of the 4 cards interactive (their favorite for an MVP), (2) make all 4 interactive
  with their own drill-down, (3) keep only 1 interactive but add a clear affordance (chevron/button/
  distinct press state). Do not implement any of the three without an explicit decision first.
- **Recommended Resolution:** revisit during Product Polish alongside the rest of the
  microinteraction/affordance pass — this is exactly the kind of finding that sprint is for.

---

## Active Technical Debt Item 27: No real Identity/Profile backend module exists

- **Description:** Found 2026-07-16, Profile functional audit (see RI-6) — there is no backend
  module, domain aggregate, or mobile API layer for a real user profile (name, email, plan/billing).
  `useSession()` exposes only `identityId`/`sessionStatus`/`hasSeenOnboarding`. This is the same
  situation as Goal (TD-10/A1: "Goal aggregate has no backend module") — a whole capability that only
  exists in its Demo Mode form today.
- **Impact:** Medium. With Demo Mode off, Profile now honestly shows no name/email/plan (fixed, see
  RI-6) rather than fabricated ones — correct, but means a real (non-demo) user genuinely can't see
  their own name/email/plan anywhere in the app yet, because nothing stores or serves it.
- **Priority:** Medium — not urgent (the app's primary usage today is demo-mode-first, same posture
  as Goal), but structurally important before any real-user rollout. Billing/plan management
  specifically has no backend anywhere either (`profile.tsx`'s "Gestionar" is already plain text, not
  a button, for this exact reason).
- **Recommended Resolution:** when a real backend Identity/Profile module is built, give it the same
  API-layer seam `profile.api.ts` already establishes (`profileApi.getCurrentUser`) — the mobile side
  is already structured to take a real branch without touching `profile.tsx` again.
- **Product Polish note (not VS-032 scope):** the current `isDemoProfile: false` UI just renders each
  field as absent (blank name row, no plan card) — correct and honest, but user-flagged as feeling
  too empty. Suggested for Product Polish: replace the blank state with explicit copy communicating
  _why_ it's empty — e.g. "Inicia sesión para sincronizar tus datos entre dispositivos" (if a real
  auth/sync flow is coming) or "Perfil local — tus datos permanecen únicamente en este dispositivo"
  (if not). Which framing is correct depends on product direction for real auth, not decided yet —
  don't implement either without that decision first.

---

## Active Technical Debt Item 28: "Alto contraste" (High Contrast) setting has zero visual effect

- **Description:** Found 2026-07-16, Appearance functional audit (VS-032 closing checkpoint). The
  toggle updates `AppearanceSettings.highContrast`, persists to SecureStore, and its own switch
  animates correctly — but nothing downstream ever acts on the value. `ThemeResolver.resolve()`
  (`packages/theme-engine/src/core/ThemeResolver.ts`) receives `context.highContrast`, stores it
  unmodified as `ResolvedAppearance.isHighContrast`, and its own inline comment says "we _could_
  dynamically adjust colors here" — aspirational, never implemented. `AppearanceProvider.tsx` passes
  `highContrast` into the resolver but nothing reads `resolvedAppearance.isHighContrast` anywhere
  else in the app. Confirmed empirically (Playwright): sampled computed styles of body background and
  the first 30 rendered elements' text colors before/after toggling the switch — byte-for-byte
  identical.
- **Impact:** Medium. Not a WCAG AA violation — all 4 themes already pass AA contrast on their base
  `contentPrimary`/`contentSecondary` pairs without this toggle (independently verified this session,
  worst case Forest's `contentSecondary`-on-`background` at 4.48:1, effectively at threshold). The
  harm is a misleading control: a user who toggles "Aumenta el contraste para una mejor legibilidad"
  reasonably expects _something_ to change and nothing does.
- **Priority:** Medium — not fixed now. Building a real per-theme high-contrast palette (or a
  systematic color-boost transform) is a new capability, not a bug fix, and out of scope for this
  checkpoint's explicit "no new capabilities" framing. Two honest resolutions exist for a future
  pass: (1) implement real high-contrast variants per theme (meaningful design + engineering work),
  or (2) remove the setting until it's real. Do not implement either without an explicit decision.
- **Recommended Resolution:** decide (1) vs (2) as part of Product Polish or a dedicated
  accessibility pass; if (1), the seam is already correct — `ThemeResolver.resolve()` is exactly
  where the adjustment belongs, `isHighContrast` already flows all the way through.

---

## Active Technical Debt Item 29: React 19 `element.ref` deprecation warning fires somewhere in the render tree

- **Description:** Found 2026-07-16, Product Polish's first golden-path walkthrough. Opening the
  Quick Capture dialog reliably (though not on every single run — timing-sensitive) logs
  `console.error: Accessing element.ref was removed in React 19. ref is now a regular prop. It will
be removed from the JSX Element type in a future release.` On web dev builds this occasionally
  rendered as a visible red toast overlapping the tab bar. No custom toast/error-boundary component
  exists anywhere in app source (confirmed via repo-wide grep) — this is almost certainly Expo/
  Metro's built-in web dev error overlay surfacing the `console.error`, not app code, so it should
  not reach production builds. Not yet root-caused to a specific component or dependency — the
  legacy `element.ref`-access pattern could be in app code, Tamagui, or react-native-web.
- **Impact:** Low as a user-facing issue (dev-only overlay, unconfirmed reproduction). Medium as a
  forward-looking one — this is exactly the kind of warning that becomes a hard error in a future
  React major version; better to find and fix the source now than during an eventual React upgrade.
- **Priority:** Low. Not blocking, not fixed this pass — needs a proper repro (bisect which
  component's `.ref` access triggers it) before a real fix is possible.
- **Recommended Resolution:** reproduce reliably (seems tied to Dialog open/close, not yet isolated
  further), then trace via React DevTools' component stack at the point the warning fires to find
  the actual `element.ref` access site.

---

## Resolved Issues — Lessons Learned

Bugs found and fixed **within the same session they were discovered**, before the affected
capability was marked complete — logged here for the architectural lesson each one leaves, not as
open debt. Nothing in this section is deferred or pending.

### RI-1: Tasks' primary "New task" FAB was visually present but unclickable on web

Found 2026-07-16, during a mandatory functional audit of Tasks (VS-032) triggered by user distrust
of a checkpoint that had verified persistence/logic but never verified that the primary creation
CTA was actually reachable by click. Classified **P1/Critical** while open — it blocked the main,
obvious path to create a Task.

- **Root cause:** `TasksScreen.tsx`'s FAB had `position="absolute"; zIndex={100}`, but that z-index
  was scoped several `position:relative` Views deep inside the screen's own `ScrollView` tree — it
  never competed at the same stacking level as `FloatingTabBar` (rendered as a separate, later
  sibling by `(tabs)/_layout.tsx`, with no z-index of its own). On web, DOM paint order settled the
  conflict in the tab bar's favor: `document.elementFromPoint()` at the FAB's exact center returned
  the "Perfil" tab, and every real (and forced) click landed there instead of on the FAB.
- **Solution applied:** moved the FAB's render into the existing `<Portal>` primitive (the same
  mechanism `Dialog`/`BottomSheet`/`ActionSheet` already use to render above everything), explicitly
  re-wrapped in `<Theme name={themeId}>` sourced from `useAppearanceStore` — Portal content sits
  outside `AppearanceProvider`'s theme wrapper (Item 20), so without this the FAB would have silently
  reverted to the default theme under Midnight/Forest/Sunrise.
- **Verified:** `document.elementFromPoint()` at the FAB's center now resolves to the FAB itself; a
  real (non-forced) Playwright click opens Quick Capture; re-confirmed visually under Midnight theme
  (dark background, correctly-purple FAB) with a fresh Playwright screenshot.
- **New rule this leaves (see ENGINEERING_BOARD.md):** a floating/absolutely-positioned control that
  must render above the tab bar or another cross-cutting overlay belongs in `<Portal>`, never a bare
  `position:absolute` + high `zIndex` inside the screen's own tree — that z-index can never escape
  the screen's local stacking context on web.

### RI-2: Demo-mode Tasks repository mutated data in place, breaking change detection

Found 2026-07-16 in the same audit — a newly created/edited/completed Task didn't appear in the
currently-active bucket until an unrelated state change (switching tabs) forced a re-render.

- **Root cause:** `demoTasksRepository`'s mutating methods (`create`, `edit`, `complete`, `archive`,
  `duplicate`, `changePriority`, `relinkGoal`, `relinkCommitment`) mutated `demoTasks` (via
  `.unshift()`) or a task object within it directly, in place — `list()` kept returning the exact
  same array reference before and after every mutation. React Query's `refetch()` and React's
  `useMemo` (`bucketTasks`/`bucketCounts` in `TasksScreen.tsx`) both key change detection on
  referential equality; with an unchanged reference, neither ever recomputed on its own. Confirmed by
  instrumenting `useDashboardContext.ts` directly (temporary `console.log` of `todayTasks`, removed
  after) and by testing each repository method individually — this was not an assumption.
- **Solution applied:** `demoTasks` changed from `const` to `let` in `demo-data.ts`, with a new
  `replaceDemoTasks(next)` setter as the only way to reassign it. Every mutating method in
  `demoTasksRepository` now builds a new array (`[task, ...demoTasks]` or `demoTasks.map(...)`) and
  calls `replaceDemoTasks()` — the exact pattern `demoHabitsRepository`'s `replace()` already used
  correctly (via `.map()`), which is why Habits never had this bug.
- **Verified:** 8 new Jest tests assert every mutating method returns a new array reference (not
  `toBe` the pre-mutation one). Playwright, in-app navigation only (no `page.goto()` mid-flow —
  that's a full reload and resets demo state, a distinct trap documented separately): creating,
  editing, and completing a task now reflects immediately in the currently-active bucket with zero
  extra interaction; a newly created high-priority Goal-linked task correctly won Today's Hero over
  the existing seed winner on a score tie, proving the fix reaches every consumer (`TasksScreen`,
  Today's `useDashboardQuery`), not just the one path first tested.
- **New rule this leaves (see ENGINEERING_BOARD.md):** any demo-mode repository backing React Query
  data must return a new array/object reference on every mutation, never mutate a cached array or
  its elements in place. `demoHabitsRepository`'s `replace()` is the reference pattern — new
  repositories should copy it, not the old `demoTasksRepository`.

### RI-3: `AppScreen` had no background of its own — short screens showed a light gap under any non-default theme

Found 2026-07-16 auditing Insights' Focus detail screen under Midnight: the content card rendered
correctly dark, but the empty space below it (screen taller than content) stayed light/white.

- **Root cause:** `ScreenScroll`'s content container is `flexGrow: 1` (correctly fills at least the
  viewport), but each consuming screen's own top-level `YStack` only sizes to its own content height
  and only THAT `YStack` had `backgroundColor="$background"` set. On a screen shorter than the
  viewport, the gap between the `YStack`'s bottom and the actual (grown) container's bottom edge
  showed whatever `AppScreen`'s own outer `View` defaulted to — nothing. This is the mechanism behind
  the already-documented "AppScreen sets no background of its own" pattern (previously worked around
  per-screen, one `$background` prop at a time, on tall screens where the gap was never visible).
- **Solution applied:** added `backgroundColor="$background"` to `AppScreen.tsx`'s own outer `View`
  (`packages/design-system/src/screens/AppScreen.tsx`) — one fix covers every current and future
  consumer (12 screens today), instead of relying on each screen remembering it. Consumers keep their
  own `$background` too (harmless, same token) — that's what made tall screens look correct before
  this fix existed.
- **Verified:** design-system snapshot tests updated (2 snapshots, diff confirmed to be exactly the
  new `backgroundColor` line, nothing else) — 225/225 tests passing. Playwright, Midnight theme: the
  light gap below Focus detail's content is gone; re-checked Goal Workspace (unrelated screen, also
  short-content-prone) and confirms the same fix applies there too.
- **New rule this leaves:** screen-level background should be set once, at the shared screen
  primitive (`AppScreen`), not re-declared per consumer — a per-consumer `$background` is now
  redundant defense, not the actual fix, for any future screen using `AppScreen`.

### RI-4: Insights had a feature-local `StatCard` duplicating `@commitment/design-system`'s `StatCard`

Found 2026-07-16, Insights' Design System audit — `packages/design-system/src/components/StatCard.tsx`'s
own doc comment names "Insights' weekly overview" as its reference use case (trend/delta line + a
visual/sparkline slot), but `InsightsScreen.tsx` was using a separate, feature-local `StatCard.tsx`
with the same shape (title, value, delta, sparkline) built independently.

- **Root cause:** the design-system `StatCard` was apparently built for this exact screen but never
  actually wired up — the feature kept its own pre-existing implementation instead.
- **Solution applied:** deleted `features/insights/ui/components/StatCard.tsx`; `InsightsScreen.tsx`
  now uses the design-system `StatCard` directly, passing the feature's own `Sparkline` (kept
  feature-side — design-system doesn't depend on `react-native-svg`) into `StatCard`'s `visual` slot,
  and a pre-formatted `deltaLabel`/`deltaTone` instead of a raw delta number.
- **Verified:** `tsc --noEmit` clean, Playwright confirms all 4 stat cards render with correct values,
  sparklines, and delta coloring, real-data test (completing a task) confirmed the card updates.
- **New rule this leaves:** when a design-system component's own doc comment names a specific screen
  as its reference use case, check whether that screen is actually using it before building or
  keeping a feature-local equivalent.

### RI-5: Insights' "Hábitos de Hoy" card duplicated Today's own widget — replaced with a real product decision, not just a relabel

Flagged as a UX finding during the 2026-07-16 audit, decided the same day (not deferred like the
stat-card-affordance finding, because it "afecta la identidad del producto" per explicit user
reasoning): Today answers "¿qué debo hacer hoy?"; Insights should answer "¿cómo voy en el tiempo?".
`HabitConsistencyInsight` showed today's due/completed/at-risk habits — the same question Today's own
habit widget already answers, so the two screens competed instead of complementing each other.

- **Decision:** remove the today-snapshot framing entirely, replace with a real trend/consistency
  metric. Considered "peor día de la semana" / "consistencia de los últimos 7 días" (both explicitly
  suggested) but **the domain model has no per-day habit completion history** — only
  `currentStreakDays`, `completedToday`, `lastCompletedDate` — so a real per-day breakdown isn't
  honestly computable without fabricating data, which this codebase's engines consistently refuse to
  do (see every "no fabricated history" comment across `daily-metrics.ts`/`computeDailyActivity`/etc).
- **Solution applied:** `HabitConsistencyInsight.tsx` now shows **Racha promedio** (average
  `currentStreakDays` across all enabled habits) and **Con racha activa** (count with
  `currentStreakDays > 0`, out of total enabled) — both honestly computable today, both genuinely
  about consistency-over-time rather than a today-snapshot, and non-redundant with
  `StreakHighlightInsight`'s single best streak (average smooths out one great habit carrying the
  rest; this card answers "how consistent am I overall," not "what's my best run").
- **Verified:** Playwright confirms "Hábitos de Hoy" text no longer appears anywhere in Insights,
  "Consistencia de Hábitos" renders with real computed numbers (8 día promedio / 9 de 9 con racha
  activa in the current demo dataset), no layout regression.
- **New rule this leaves:** when replacing a UX-flagged card, check what the domain model can
  actually support honestly before picking a replacement metric — "sounds right" isn't sufficient if
  it would require fabricating history the app doesn't track.

### RI-6: Profile always showed the hardcoded demo identity, even with Demo Mode off

Found 2026-07-16, Profile functional audit — the previous checkpoint-avoidance lesson from Tasks
applied here before any checkpoint was written this time, not after a false claim.

- **Root cause:** `profile.tsx` imported `demoUser` (a static object, "Jordan Rivera") directly from
  `demo-data.ts` and rendered it unconditionally — the only Demo-Mode-agnostic screen in the app
  (every other feature branches on `isDemoModeActive()` at the API-layer seam, per
  `demo-mode.store.ts`'s own documented contract). Confirmed live: toggling Demo Mode off still
  showed "Jordan Rivera / jordan.rivera@commitment.app / Plan Pro."
- **Constraint found while fixing:** there is no real Identity/Profile backend module (mobile or
  backend) anywhere in this codebase — same situation as Goal (TD-10/A1, see Item 27 below). The fix
  therefore isn't "fetch real data instead" — it's "stop presenting fabricated data as real."
- **Solution applied:** new `features/profile/api/profile.api.ts` (respects the documented
  API-layer-is-the-seam rule) returns the demo identity with `isDemoProfile: true` in Demo Mode, and
  an honest minimal profile (`name`/`email`/`plan`/`memberSince` all `null`, avatar initials derived
  from the real `identityId`) with `isDemoProfile: false` otherwise. `profile.tsx` conditionally
  renders the name/email/plan badge/"MI PLAN" card only when that data actually exists, instead of
  assuming it always does.
- **Verified:** Playwright, both Demo Mode states — ON shows the full demo identity as before; OFF
  shows initials derived from the real identityId, "Tu cuenta" generic label, no plan badge, no
  email, no "MI PLAN" section. `tsc --noEmit` clean.
- **New rule this leaves:** any screen showing "the current user" must go through the same
  demo/real API-layer seam every other feature uses — a screen that always renders demo content
  regardless of the toggle is exactly the kind of thing a functional audit (not a code read) catches.

---

### RI-7: Theme picker cards had no screen-reader-visible selected state

Found 2026-07-16, Appearance accessibility audit — confirmed via DOM inspection, not assumed.

- **Root cause:** `ThemePreviewCard.tsx` deliberately avoids Design System / Tamagui components (see
  ADR-018 §2 — it must render each card in a theme _other_ than the currently active one, so it can't
  sit inside the ambient Tamagui theme context). In doing so it also bypassed
  `toPlatformAccessibilityProps`, the DS helper every other interactive element in the app uses to
  translate `accessibilityState` into real `aria-*` attributes on web. It set raw
  `accessibilityRole="button"` / `accessibilityState={{ selected }}` directly on a plain
  `react-native` `TouchableOpacity` instead — react-native-web's own `TouchableOpacity` only consumes
  `accessibilityState.disabled` internally (confirmed by reading its source); it never emits
  `aria-selected`/`aria-checked` for any other state key. Result: confirmed via Playwright DOM query
  — zero `aria-selected` attributes rendered for any of the 4 theme cards, before or after selection.
  Only sighted users could tell which theme was active (a 2px accent border).
- **Scope note:** this is a real bug in existing accessibility semantics, not a new capability — in
  scope even under the checkpoint's explicit "no new capabilities" framing and the UI Freeze's
  standing accessibility-fix exception. It also doesn't reintroduce the bug ADR-018 exists to avoid:
  `toPlatformAccessibilityProps` is a stateless prop-mapping utility, not a themed component — it
  doesn't read from Tamagui's ambient theme context the way a DS `Button`/`Card` would.
- **Solution applied:** `ThemePreviewCard.tsx` now imports `toPlatformAccessibilityProps` from
  `@commitment/design-system` and spreads its output (in place of the raw `accessibilityRole`/
  `accessibilityState`/`accessibilityLabel` props) onto the `TouchableOpacity`.
- **Verified:** Playwright DOM query before/after fix — `aria-selected` now present and correct
  (`"true"` on exactly the active card, `"false"` on the other 3) both on initial load and after
  clicking a different card. Keyboard Tab order through all 4 cards + both switches confirmed intact.
  `tsc --noEmit` clean.

---

### RI-8: Quick Capture always defaulted to "Tarea" regardless of which screen's "+" opened it

Found 2026-07-16, Product Polish's first golden-path walkthrough (`PRODUCT_POLISH_GUIDE.md`
methodology) — not a code read, found by actually creating a Goal via the Goals screen's own "+"
button and noticing it never appeared in the Goals list.

- **Root cause:** `QuickCaptureDialog.tsx` hardcoded `useState<CaptureType>('task')` and never read
  `quickCaptureSource` (the string every screen's "+" button already passes to `openQuickCapture()`,
  e.g. `'goals'`, `'tasks'`) — that value's own doc comment says it's "carried through as the
  capture's analytics source," so it was never wired to anything functional. Result: tapping "+" on
  the Goals screen (Objetivos sub-tab) opened Quick Capture pre-selected to **Tarea**, not
  **Objetivo** — a user typing a goal title there silently got a Task instead, with zero indication
  anything unexpected happened.
- **Compounding issue found while fixing:** `GoalsScreen.tsx`'s `handleCreate()` only special-cased
  the `habits` sub-tab (routes to a dedicated form); every other sub-tab — including `tasks` and
  `roadmaps` — funneled into the same `openQuickCapture('goals')` call regardless of which was
  actually active. `roadmaps` is worse: it has no domain concept to create at all yet (`RoadmapsTab`
  is an honest empty-state placeholder, no aggregate/repository), so its FAB opened a dialog with no
  correct default for anything.
- **Solution applied:** `QuickCaptureDialog.tsx` gained a `SOURCE_DEFAULT_TYPE` map (currently just
  `{ goals: 'goal' }` — other sources have no single obvious type and correctly keep falling through
  to `'task'`), consulted in the same effect that already handles Coach-suggestion prefills.
  `GoalsScreen.tsx`'s `handleCreate()` now passes `'tasks'` as the source when the Tareas sub-tab is
  active (was always `'goals'`), and its FAB is hidden entirely on the Roadmaps sub-tab.
- **Verified:** Playwright DOM query of `aria-selected` on the 4 capture-type buttons — Objetivos
  sub-tab opens on "Objetivo" (was "Tarea"), Tareas sub-tab opens on "Tarea" (was silently "Tarea"
  by accident, now correctly and explicitly so), Roadmaps sub-tab has no FAB (was a dangling
  misleading button). `tsc --noEmit` clean.

---

### RI-9: Quick-Capturing a Goal or Habit never invalidated the list that displays it

Found 2026-07-16, same walkthrough as RI-8 — even after fixing the wrong-default-type bug, a
correctly-typed Quick-Captured Goal still didn't appear in the Goals list without an unrelated
re-render forcing a refetch.

- **Root cause:** `QuickCaptureDialog.tsx`'s `handleCapture()` only ever called
  `queryClient.invalidateQueries(...)` in its `task` branch (the original, presumably first-written
  path) — the `goal` and `habit` branches called their respective `*Api.create()` and stopped, never
  telling React Query anything changed. Every other mutation in the codebase goes through a
  `useMutation` hook with its own `onSuccess: () => invalidateQueries(...)` (see `useGoals.ts`,
  `useHabits.ts`) — `QuickCaptureDialog` is the one place that calls the API layer directly and
  always has, so it never inherited that pattern.
- **Solution applied:** added `queryClient.invalidateQueries({ queryKey: queryKeys.goals.all })`
  after a successful goal capture, and `queryKeys.habits.all` + `['dashboard']` (Today's "Hábitos de
  Hoy" widget needs to know too) after a successful habit capture. `note` has no consuming
  `useQuery` anywhere in the app yet (no Notes list screen exists) — nothing to invalidate.
- **Verified:** Playwright — a Quick-Captured Goal now appears in the Objetivos list immediately
  after submit, no navigation/tab-switch required. `tsc --noEmit` clean.

---

### RI-10: `demoHabitsRepository.create()` mutated its array in place — same bug class as Tasks' RI-2, one method deep

Found 2026-07-16, same walkthrough — after fixing RI-8/RI-9, a Habit created via the **dedicated**
Create Habit form (not Quick Capture, which already goes through the correct `useCreateHabit`
mutation hook with a proper `onSuccess` invalidation) _still_ didn't appear.

- **Root cause:** `demo-habits.repository.ts`'s `create()` used `demoHabitDTOs.push(newHabit)` —
  mutating the array in place rather than reassigning it. `list()` returns `demoHabitDTOs` by
  reference; React Query's refetch-after-invalidate correctly re-ran the query, but got back the
  "same" array reference (now containing the new item, but `===` the previous one), which can
  short-circuit downstream re-renders relying on referential-equality change detection. This is the
  exact bug class as Tasks' RI-2 (2026-07-16, earlier the same day) — that fix's own `replace()`
  helper (`.map()`-rebuild) was already correctly used by `edit`/toggle-style mutations in this same
  file; `create()` was simply never brought into that pattern because it predates it and nothing had
  exercised "does a newly created Habit appear immediately" until this walkthrough.
- **Solution applied:** `create()` now reassigns `demoHabitDTOs = [...demoHabitDTOs, newHabit]`
  instead of `.push()`.
- **Verified:** Playwright — a Habit created via the dedicated form now appears immediately in the
  Hábitos sub-tab (previously invisible even after scrolling and forcing a manual refetch). Added a
  dedicated regression test (`demo-habits.repository.test.ts`, new `describe` block) asserting
  `list().items` is a new reference after `create()` — same pattern as Tasks' RI-2 regression tests.
  `npx jest demo-habits.repository`: 3/3 passing. `tsc --noEmit` clean.
- **New rule this leaves:** whenever a demo repository's fix pattern (`replace()`/spread-reassign
  instead of in-place mutation) gets established for _some_ of its methods, check _all_ of them —
  `create()` specifically is easy to miss because "does the new item show up without a manual
  refresh" is exactly the kind of check a functional audit does but a domain/CQRS-level test doesn't.

---

### RI-11: Motion infrastructure — real values wired, plus a real dead-code bug found along the way

Found/fixed 2026-07-16, first infrastructure work under Product Polish (per
`COMMITMENT_EXPERIENCE_GUIDE.md` §5 and the user's explicit direction: centralize Motion before
resuming screen audits, so a future change reaches the whole app through one place). Three
genuinely separate pieces, landed together:

1. **`ThemeMotion` given real values.** All 4 themes' `motion` fields were `null`/generic
   (`fast: 150, normal: 300, slow: 500`, everything else `null`) since the type was introduced.
   Now: `buttonPress: 120`, `cardEntrance: 220`, `pageTransition: 300`,
   `modalTransition`/`spring: { mass: 1, damping: 26, stiffness: 300 }`, `listAnimation: 40`
   (identical across all 4 themes — Motion is a product-level standard, not a per-theme
   aesthetic). Tightened `ThemeMotion`'s types from `any` to `number`/`ThemeSpringConfig`.
   `ThemeResolver`'s reduced-motion handling was zeroing only the old generic `fast`/`normal`/
   `slow` trio — extended to zero every duration field the semantic names actually correspond to
   (`pageTransition`/`buttonPress`/`cardEntrance`/`listAnimation`); spring configs are left as
   physical params, since a component using spring-driven motion should check
   `ResolvedAppearance.isReducedMotion` directly and skip the animation rather than rely on a
   zeroed spring, same as (2) below already does.
2. **`AppearanceProvider.tsx`'s theme-crossfade** used a hardcoded `withTiming(0, { duration: 200
})` matching no other value in the app. Now reads `resolvedAppearance.theme.motion.pageTransition`
   (300ms). **Verified empirically** — sampled the crossfade overlay's opacity at 40ms intervals
   mid-transition (0.97 → 0.83 → 0.67 → 0.37 decaying smoothly), confirming this is a real,
   working interpolation, not just a value swap.
3. **Found a real, separate dead-code bug while wiring Tamagui's own animation config:**
   `useInteractionAnimation` (`packages/design-system/src/interaction/InteractionAnimation.ts`) —
   the shared hook `Button`/`Card`/`Switch`/`IconButton`/`Surface` all use for press feedback —
   has returned `animation: 'fast'` since it was written. `'fast'` was never a valid Tamagui
   animation preset name on either platform (confirmed by reading `@tamagui/config`'s own source:
   neither the web CSS driver nor the native RN driver define a `fast` key). **Worse: even after
   correcting the name, none of the 5 consuming components ever actually applied the `animation`
   field to their JSX** — every one destructured `animationStyle.opacity`/`.scale` individually and
   silently dropped `.animation`. Press feedback's scale/opacity values were changing correctly
   (confirmed via `getComputedStyle` before/mid/after a real mouse-down), but with no
   transition applied, they snapped instead of eased — on every Button, Card, Switch, IconButton,
   and Surface press, since these components were first built.

**Solution applied:** renamed `'fast'` → `'buttonPress'` (a real preset, see below) in
`InteractionAnimation.ts`; added `animation={animationStyle.animation}` (or an `{...(... as any)}`
spread where Tamagui's types don't recognize `animation` as a valid prop on that specific `View`
usage — 4 of 5 components needed this, `Button.tsx` didn't for unclear structural-typing reasons)
to all 5 components. Added `packages/design-system/src/tokens/motion.ts` (web, CSS transition
strings) and `motion.native.ts` (native, RN Animated config) defining `buttonPress`/`cardEntrance`/
`pageTransition`/`modalTransition` as real named presets, extending (not replacing) Tamagui's stock
animation driver in `tamagui.config.ts`.

**Verified:** `tsc --noEmit` clean across `theme-engine`/`design-system`/`apps/mobile`. 225/225
design-system tests passing (11 snapshots updated — every diff confirmed to be exactly the new
`animation="buttonPress"` prop before updating, nothing else). `demoHabitDTOs` referential-check
unaffected. Scale/opacity state changes on press confirmed via Playwright
(`getComputedStyle`/`className` inspection, real `mouse.down()`/`mouse.up()`, not `force:true`).

**Not fully verified at the time this entry was first written:** even with the preset correctly
named and the prop applied to every consumer's JSX, no visible CSS transition appeared for the
scale/opacity press feedback. Logged as Item 30, then root-caused and fixed the same day — see
**RI-12** immediately below.

---

### RI-12: Item 30 resolved — the real prop is `transition`, not `animation`; and `createAnimations()` must be called once with the full merged preset map

Investigated 2026-07-16, same day as RI-11, per explicit user direction: before resuming screen
audits, spend a short, targeted investigation answering one concrete question — is Tamagui's
animation pipeline disabled by configuration, or does it simply never fire for this renderer? Not
"fix it necessarily," just "find out which." It turned out to be neither, and fully fixable.

**Root cause 1 — wrong prop name.** Built an isolated, unlinked diagnostic route
(`apps/mobile/src/app/motion-probe.tsx`, deleted after the investigation) with a bare Tamagui
`View` and a **literal** `animation="quick"` prop — the simplest, most static case possible,
outside this app's component tree entirely. It also produced `transitionDuration: 0s` and an
empty inline `style.transition`. Reading `@tamagui/web`'s own source
(`useComponentState.ts`) found the actual gate:

```ts
const hasAnimationProp = Boolean(
  (!isHOC && 'transition' in props) || (props.style && hasAnimatedStyleValue(props.style)),
);
```

The installed Tamagui version (2.4.2) activates its entire animation runtime on a prop literally
named **`transition`** — not `animation`. `animation` is accepted by some component type
signatures (explaining why it type-checked, sometimes only with an `as any` cast) but never sets
`hasAnimationProp`, so `useAnimations()` never meaningfully runs. Confirmed instantly: changing
the probe to `transition="quick"` produced a real `transitionDuration: 0.15s` with the correct
easing. This is a version-specific Tamagui API rename this codebase's `animation="bouncy"`
convention (predating this session, e.g. the original raw `AppearanceSettingsScreen.tsx` code)
never caught up to.

**Root cause 2 — found while fixing root cause 1.** Renaming the prop to `transition` everywhere
fixed the isolated probe with Tamagui's _stock_ presets (`quick`, etc.) but **still failed for
Commitment's own custom presets** (`buttonPress`, etc.) — both as a literal string and as the
dynamic hook-sourced value RI-11 already wired up. Reading `@tamagui/animations-css`'s
`createAnimations()` source revealed why: the function returns `{ animations, useAnimations, ... }`
where `useAnimations` is a **closure bound to whatever map was passed into `createAnimations()` at
creation time** — it looks up preset names via that closed-over reference, not via
`this.animations` or any live re-read of the returned object's own `.animations` property.
`tamagui.config.ts`'s original merge —

```ts
animations: { ...configBase.animations, animations: { ...configBase.animations.animations, ...motionAnimations } }
```

— overwrote the _returned object's_ `.animations` data property (cosmetically correct, confirmed
present in the regenerated `.tamagui/tamagui.config.json` babel-plugin cache) but never touched
what the already-created `useAnimations` closure actually reads from. Stock presets resolved fine
(they were in the _original_ map the closure captured); Commitment's own were invisible to it.
**Fix:** `packages/design-system/src/tokens/motion.ts` (web) / `motion.native.ts` (native) now
import the platform's stock preset map (`configBase.animations.animations`), spread it together
with Commitment's own presets into **one** `createAnimations()` call, and export the complete
resulting driver directly. `tamagui.config.ts` uses that driver as-is (`animations:
motionAnimationDriver`) instead of re-assembling one from parts. `@tamagui/animations-css` and
`@tamagui/animations-react-native` added as direct dependencies (previously only transitive via
`@tamagui/config`) since this file now calls `createAnimations()` itself.

**Solution applied, all together:**

- `useInteractionAnimation` returns `transition: 'buttonPress'`, not `animation: 'fast'`.
- All 5 components (`Button`/`Card`/`Switch`/`IconButton`/`Surface`) pass
  `transition={animationStyle.transition}` — a properly-typed prop, so every `as any` cast RI-11
  needed for `animation` was removed too.
- `tokens/motion.ts`/`motion.native.ts` build one complete animation driver via a single
  `createAnimations()` call merging stock + custom presets.

**Verified end-to-end, not just by code review:**

- Real press on the Goals screen's actual "+" FAB (not the probe): `transitionDuration` went from
  `0s` to `0.12s` with the correct cubic-bezier; a 30ms-into-the-transition sample showed genuine
  interpolation (`scale: 0.9766`, `opacity: 0.906`), not an instant snap to the end value.
- Switch's outer row wrapper (5 DOM levels up from `[role="switch"]`) confirmed at `0.12s` too.
- `tsc --noEmit` clean across `theme-engine`/`design-system`/`apps/mobile`.
- 225/225 design-system tests passing — 24 snapshots updated this round (on top of RI-11's 11);
  every diff reviewed and confirmed to be the expected consequence of the fix genuinely activating
  (colors resolving through RN's animated-style pipeline, `collapsable={false}` appearing — the
  standard RN flag marking a view as truly animated, not present before because `hasAnimationProp`
  was false), never an unrelated or unexplained change.
- `apps/mobile` jest: 79/94 passing, same pre-existing 15 unrelated `__DEV__`-environment failures
  as before this work (`TECH_DEBT.md` Item 16) — no new failures.
- Grepped the whole app for any remaining `animation="..."` JSX usage — none found; the rename is
  complete.

**Not verified:** native platforms (iOS/Android) — no simulator access in this environment. The
native driver (`motion.native.ts`) follows the identical merge-then-`createAnimations()` pattern,
so it should be equally correct, but hasn't been run on-device.

**New rule this leaves:** the answer to the user's diagnostic question was neither "disabled by
config" nor "never implemented for this renderer" — it was a version-specific prop rename
(`animation` → `transition`) this codebase's existing convention predated, compounded by a subtle
JS closure-binding gotcha in how `createAnimations()`'s driver object gets extended. Anyone adding
a new Tamagui animation preset in the future should call `createAnimations()` once with the
complete merged map (see `tokens/motion.ts`) — never spread/overwrite `.animations` onto an
already-built driver object afterward, since the driver's own hooks won't see it.

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

- **v1.22.0 (2026-07-15):** Item 18 fully resolved — Habit↔Goal linkage is now genuinely optional
  end-to-end (domain `relinkGoal()` method + event, backend CQRS command + endpoint + projector,
  mobile picker + hook + demo repository, demo dataset gained a goal-independent habit). Found and
  fixed a real concurrent-write lost-update bug in the demo repository along the way (new regression
  test added). Product decision (2026-07-15): Goal is opt-in for Habits, not assumed — same
  principle now scoped for Tasks in a Phase 2 design proposal before implementation.
- **v1.21.0 (2026-07-15):** P1/Critical global scroll regression — full RCA performed before any
  fix (user-mandated, no trial-and-error). Root cause: `PostponeSheet`'s switch to `BottomSheet`
  was the app's first-ever use of `@gorhom/bottom-sheet` (via the pre-existing `BottomSheetAdapter`),
  which requires `GestureHandlerRootView` at the app root — confirmed missing app-wide. Fixed by
  wrapping `app/_layout.tsx` in it (the library's own documented requirement). Verified across all 9
  requested screens on web; native device/simulator re-verification wasn't possible in this
  environment (no simulator access) — flagged as an honest limitation, not hidden. Registered as
  Item 21.
- **v1.20.0 (2026-07-15):** Postpone redesigned around a new Design System primitive,
  `DurationWheelPicker` (`packages/design-system/src/pickers/`) — an iOS Timer-style wheel picker
  (hours + minutes, tap-or-scroll-to-select, no chips/input/"custom" mode), per explicit user
  direction that **overrides** the standing "no new Design System components" rule from the Habits
  adoption pass specifically for this piece of work — built as a genuinely reusable primitive (named
  future consumers: Tasks, notification snooze, countdowns, focus-session timers), not
  Habits-specific. `PostponeSheet.tsx` rewritten around it, switched from `Dialog` to `BottomSheet`,
  domain logic unchanged (`usePostponeHabit(minutes: number)` untouched). Found and fixed a real bug
  in the picker's own first draft: the wheel column wasn't clipped (missing `overflow="hidden"` +
  explicit `ScrollView` height), so all rows rendered in a flowing list instead of a windowed wheel —
  fixed, verified both tap-to-select and scroll-snap now correctly re-center the chosen row.
  Registered Item 20 (High, pre-existing, not caused by this change): every `Portal`-rendered modal
  in the app ignores the active theme on web — caught only now because this is the first time a
  modal was screenshotted in a non-default theme. 6 new tests for `DurationWheelPicker` (design
  system suite now 30/30 suites, 225/225 tests). Verified: `tsc --noEmit` clean (both packages),
  mobile jest 64/78 (same pre-existing failures), Playwright across all 4 themes + tap-select +
  scroll-select + keyboard (Tab reaches each wheel row as a real button) + full postpone flow
  (confirm closes the sheet, mutation fires).
- **v1.19.0 (2026-07-15):** Habits UX redesign, iteration 2 — user reviewed iteration 1's list card
  (goal caption + edit + postpone all visible, no dominant action) and asked for a radical
  simplification instead, Apple Reminders-style: the list shows only completion circle, name,
  recurrence/time, streak, and a chevron; Postpone/Archive/Goal-context all moved to the habit's
  detail (`EditHabitScreen.tsx`, now hosting a read-only linked-Goal row + Postpone action reusing
  the existing `PostponeSheet`/`usePostponeHabit` + an Archive action reusing the existing
  `useArchiveHabit`, gated behind `ConfirmationDialog` — no new mutations added, only relocated UI
  entry points, per explicit "no agregar funcionalidades" instruction). `HabitsHero` redesigned
  toward an Activity Rings layout — the ring now shows a raw "4/7" count (custom-positioned over
  `ProgressMetric`, which has no center-content slot of its own) plus two stat rows beside it
  (streak, completed today) instead of one combined sentence. Found and fixed a real regression this
  iteration's own first draft introduced: nesting the completion circle inside a `clickable` Card
  made both resolve to real `<button>` elements (per TD-015's own fix), producing invalid
  `<button>`-inside-`<button>` HTML and a React hydration-error console message — same defect class
  as TD-015's follow-up regression #1. Fixed by making the circle and the "open detail" region
  siblings, not nested, both direct children of a non-interactive `Card`. Verified via keyboard: Tab
  correctly cycles circle (checkbox) → nav row (button) → next habit, Enter on the nav row navigates
  to the detail. **New pre-existing (not caused by this change) warning surfaced**: opening
  `PostponeSheet`/`ConfirmationDialog` (Tamagui `Dialog`/`Sheet`) logs "TouchableWithoutFeedback is
  deprecated" and "Accessing element.ref was removed in React 19" — library-internal, not from any
  Habits-owned code; not fixed here, logged for whoever next touches the shared `Dialog`/`Sheet`
  primitives. Verified: `tsc --noEmit` clean, mobile jest 64/78 (same pre-existing failures),
  Playwright across all 4 themes + card-tap-to-detail + keyboard, 0 new console errors.
- **v1.18.0 (2026-07-15):** Habits UX redesign (Apple Health/Fitness/Timers-inspired, per explicit
  user direction — visual/interaction quality, not another adoption pass). New feature-local
  components (not Design System additions): `HabitCard.tsx` (44px completion circle with press +
  completion-pulse animation via the existing `useInteractionState`/`useInteractionAnimation` hooks,
  streak badge, goal context) and `HabitsHero.tsx` (`ProgressMetric`-based today's-completion ring +
  streak highlight). `HabitCard` consolidated 3 near-duplicate hand-rolled habit rows
  (`TodayHabitsScreen.tsx`, Goals' `HabitsTab.tsx`, `GoalWorkspaceScreen.tsx`'s linked-habits list)
  into one shared component — a real, contained duplication removed, not a cross-feature one (all 3
  call sites are within the Habits/Goals feature boundary). Two more real bugs found live via
  Playwright and fixed: (1) `TodayHabitsScreen.tsx` had an undocumented P2 instance (Stack header +
  body title both said "Hábitos de Hoy") — fixed by removing the redundant body title, see
  `architecture_product_audit_2026Q3.md` v1.3.0; (2) a classic flexbox bug (`HabitCard`'s title/meta
  column lacked `minWidth={0}`) caused the streak badge to visually overlap the goal-name caption
  specifically in the Goals→Hábitos tab, where 2 extra icon actions leave less width than the other
  two call sites — fixed with `minWidth={0}` on the flex column + `numberOfLines={1}` on the
  goal-name caption as a safety net. Demo dataset deliberately **not** renamed to match the brief's
  suggested habit list (Morning Run, Workout, etc.) — `docs/03-architecture/DEMO_DATASET.md`'s
  contract is frozen and the existing 9 habits already have the requested variety (mixed daily/weekly
  recurrence, streaks 0–21, mixed completed/enabled states, all properly Goal-linked) — visual
  redesign alone delivers the "spectacular, not just functional" ask without touching frozen seed
  data. Verified: `tsc --noEmit` clean, mobile jest 64/78 (same pre-existing failures), Playwright
  across all 4 themes (DefaultLight/Sunrise/Forest/Midnight) plus interaction (toggle updates hero
  ring + streak live) and keyboard (`Tab` reaches a real `<BUTTON role="checkbox">`).
- **v1.17.0 (2026-07-15):** Item 18 resolved at the design level (hybrid: always-available picker
  in `HabitForm` + a `GoalWorkspaceScreen` "Add Habit" contextual entry point) per explicit user
  decision — implementation still deferred, now behind the Habits UX redesign work.
- **v1.16.0 (2026-07-15):** Habits capability audit (VS-032, first capability-level pass per the
  refined checkpoint format — not just the primary screen). Three real bugs found and fixed:
  (1) `TodayHabitsScreen.tsx` was 0% Design System adoption (raw Tamagui `Text` throughout) and used
  the deprecated mobile-local `EmptyState`, despite its own `TodayHabitsWidget` on the already-adopted
  Today screen being fully adopted — the "Ver todos" destination looked nothing like the summary it
  came from; migrated to DS `Title`/`Body`/`EmptyState`/`LoadingState`, added a missing loading state,
  fixed `numberOfLines` 1→2 truncation risk. (2) `EditHabitScreen.tsx`'s error state rendered
  `t('goals.workspace.loading')` — a copy-pasted wrong i18n key from a different feature, showing a
  "loading" string inside an error box; fixed with new `habits.workspace.error.*`/`habits.workspace.loading`
  keys (en+es) and migrated off the deprecated mobile-local `LoadingState`/`ErrorState`. (3) found live
  via Playwright Midnight-theme verification (not in any prior report): `TodayHabitsScreen.tsx`'s root
  `YStack` never set `backgroundColor="$background"` — invisible in the default (Sunrise) theme since
  its `$background` is close to the native default, but broke completely under Midnight (light
  background, light text, unreadable). Root cause: confirmed via `AppScreen.tsx`'s source that it sets
  **no background of its own** — every consumer must set `$background` explicitly; worth
  double-checking on Tasks/Insights/Profile/Appearance during their own passes. Registered Item 18
  (High — Habit↔Goal linkage has no UI path to set/change it, despite the data model supporting it;
  needs a UX decision, not built here) and Item 19 (Medium — `shared/forms/*` controls don't source
  from the Design System's `Input`/`Select`, cross-feature, deferred to a dedicated hardening pass).
  Full verification: `tsc --noEmit` clean, mobile jest 64/78 (same 14 pre-existing `__DEV__` failures,
  unrelated), Playwright across Today-widget/full-list/create/edit/Goals-tab in both themes, 0 console
  errors.
- **v1.15.0 (2026-07-15):** Goals Design System Adoption pass (VS-032). Registered Item 16
  (pre-existing, unrelated `__DEV__` jest-env gap found during standard verification) and Item 17
  (`GoalProgressBar` migration follow-up for Insights, plus a WCAG accessibility fix applied
  directly to the shared `ProgressMetric` component — fixed now, not deferred, since it's a fix-now
  trigger per the Working Agreement, not a per-screen finding). P5 (Goals text truncation) fixed —
  see `architecture_product_audit_2026Q3.md` v1.2.0.
- **v1.14.0 (2026-07-15):** Status-verification pass requested by user before closing the TD-015
  stabilization mini-phase and reporting sprint status — explicitly to confirm real state against
  code, not restate the audit's original findings from memory. Found two items already fixed but
  never logged: **Item 8 (Critical, P1)** — invisible submit buttons — confirmed via code read, both
  `CommitmentForm.tsx`/`HabitForm.tsx` already use `@commitment/design-system` `Button
variant="primary"`. **Item 9 (High, P3)** — Badge/Chip primitive — confirmed via code read,
  `Badge.tsx` exists and 2 of 3 call sites migrated (Baja-priority plain-text bug fixed); third
  call site (`shared/ui/web-badge.tsx`) is now dead code, not deleted. Both landed incidentally
  during the Design System Adoption phase's screen migrations, with no dedicated change history
  entry — this entry closes that gap. Item 10 (A1, Goal aggregate has no backend module) verified
  still open (`find apps/backend -iname "*goal*"` returns nothing). This closes the audit's sole
  Critical finding; 4 of the original 5 High findings remain open (P2 duplicated titles, P4 Tasks
  screen interaction, P5 Goals text truncation, A1/Item 10) — tracked here and in
  `architecture_product_audit_2026Q3.md`, not blocking.
- **v1.13.0 (2026-07-15):** Two TD-015 follow-up regressions, both found via review, both fixed
  same day. (1) Real `<button>` elements exposed an invalid nested-`<button>` case in
  `TodayAgendaWidget.tsx` (harmless as nested `<div>`s before) — audited all `clickable` `Card`
  usages app-wide, fixed the one instance. (2) Real `<button>` elements also pick up the browser's
  native UA chrome and this app never imported Tamagui's own `reset.css` for it (nothing needed it
  before) — fixed with one side-effect import in `app/_layout.tsx`. That reset also strips the
  native focus outline; raw (non-DS) interactive elements had no `<FocusRing>` fallback, so this
  briefly meant tabbable-but-invisible-when-focused (WCAG 2.4.7) — fixed from the same shared
  `toPlatformAccessibilityProps()` point of adaptation via Tamagui's own `focusVisibleStyle`
  mechanism. Verified live across Today/Calendar/Goals/Profile: no UA border, focus ring restored,
  still real `<button>`, Enter/Space intact, console clean.
- **v1.12.0 (2026-07-15):** VS-032 Stabilization B — fixed TD-015 (keyboard navigation) same-day
  after an RCA. Root cause: DS `Button`/`IconButton`/`Card`/`Surface` never adopted Tamagui's own
  `render`-prop mechanism (which `@tamagui/button`/`@tamagui/switch`/`@tamagui/select` all already
  use to render a real `<button>`), so they fell back to an unfocusable `<div>`. Fix is a new
  `resolveInteractiveElement()` semantic resolver wired into the existing `toPlatformAccessibilityProps`
  single point of adaptation — zero screens or components touched. Verified natively unaffected (0/214
  snapshot changes) and, live, via keyboard-only Playwright (Tab/Enter/Space) against Button,
  IconButton, Card, and FloatingTabBar. This closes the stabilization phase — resuming Design System
  Adoption at Goals next, no further infra mini-phases planned absent a critical defect.
- **v1.11.0 (2026-07-15):** Calendar screen adoption (Block 1). Fixed a real domain-correctness gap:
  Goal Milestones (which have a `targetDate`) were never fed into `buildDayAgenda` — Calendar only
  ever showed Tasks/Commitments/Habits. Extended the domain (`AgendaItemType`, `CalendarContext`) and
  `useDayAgenda` to include them; added 2 derived (not invented) milestone target dates to demo data.
  Wired tap-to-navigate on every agenda item (previously did nothing). Migrated the screen's last
  legacy `EmptyState` import and raw loading text to `@commitment/design-system`. Registered Item 15
  (High): keyboard Tab navigation doesn't reach any interactive element anywhere in the app (verified
  on both Calendar and the already-shipped Coach screen) — a pre-existing, cross-cutting Design
  System gap, flagged not fixed, per the explicit "new architectural decision → stop and report"
  rule. Also surfaced 2 demo-data gaps (no reachable empty day; no two habits share a reminder time,
  so no schedule-conflict scenario exists) — documented, not fabricated a fix for.
- **v1.10.0 (2026-07-15):** Design System stabilization mini-phase, run before resuming screen
  adoption at Calendar per explicit review feedback that a single-token patch risked an
  ever-growing, ad-hoc `theme-adapter.ts`. Audited every raw (non-wrapped) Tamagui primitive used
  anywhere in the repo end-to-end and closed the _entire_ class of missing-base-token gaps at once
  — not just `$color` — documented in the new
  `packages/design-system/docs/theme-compatibility-matrix.md` (11 tokens, each with an evidence-
  backed rationale, `✔`/`✖` — zero left `⚠ pending`). One of those, `$backgroundActive`, turned out
  to be a real (not cosmetic) bug: 3 of 4 raw `<Switch>` call sites had no visible "on" state;
  confirmed fixed via Playwright (computed `background-color` now changes `#F5F5F8` → `#6C4EFF` on
  toggle). TD-014 fixed same-day (raised to High per review feedback, see below).
- **v1.9.0 (2026-07-15):** Root-caused and fixed the `[tamagui] missing token $color` console
  warning (Category B — incomplete theme configuration, confirmed with evidence, not silenced).
  Fixed the literal bug (`CommitmentHistory.tsx`'s `color="$color"` → `"$accent"`) and the deeper
  structural gap (`adaptThemeToTamagui()` now provides `color`/`borderColor`, which `@tamagui/select`
  internally requires and which every theme silently lacked). Registered Item 14: a pre-existing,
  unrelated test-infra bug this fix's verification surfaced (design-system's per-theme snapshot
  tests have never exercised real per-theme output).
- **v1.8.0 (2026-07-15):** Fixed the Tamagui-web accessibility-prop-leak bug documented under Item 7
  (centralized `toPlatformAccessibilityProps()` helper; ~35 Design System + `apps/mobile` files
  fixed). Design System Adoption phase (Calendar screen) paused for this architectural fix per
  explicit instruction; resumes next.
- **v1.7.0 (2026-07-15):** Design System Adoption phase, Today + Coach screens. TD-013 progress:
  `coach.tsx` migrated off the legacy `EmptyState`. Fixed a pre-existing (unrelated) test-fixture
  gap in `RecommendationEngine.test.ts` (missing `priorityTask` field) discovered while verifying
  the Today migration.
- **v1.6.0 (2026-07-15):** Raised TD-012 to Medium-High. Registered Item 13 (TD-013 — duplicate
  Feedback-state components between `apps/mobile/shared/ui/feedback/` and the newly-consolidated
  `@commitment/design-system` `FeedbackState`/`LoadingState`/`EmptyState`/`ErrorState` family;
  design-system's own stale `EmptyState.tsx` was fixed in place, the 9+ mobile call sites were not
  — deferred to the screen-adoption phase).
- **v1.5.0 (2026-07-15):** Registered Item 12 (TD-012 — freeze `Card`'s public surface, deferred
  until a real need justifies the change, not implemented now).
- **v1.4.0 (2026-07-15):** VS-032 Fase E (Architecture Cleanup) executed. Item 11 marked Fixed
  (`ControlledInput`/`Select`/`DatePicker` moved to `shared/forms/`). Item 3 updated: the 2
  architectural exceptions are now formalized as ADR-018, no longer "proposed."
- **v1.3.0 (2026-07-15):** Corrected Item 3's scope (26 → 64 files, bad grep pattern), logged
  progress (11 files migrated, 3 capability gaps closed) and 2 proposed-not-yet-ADR'd exceptions.
  Registered Items 8-11 from the Architecture & Product Audit Report: invisible submit buttons on
  Commitment/Habit forms (**Critical**), missing Badge/Chip primitive (High), Goal aggregate has no
  backend module (High), generic form controls misplaced under a Commitment-specific bounded
  context (Medium).
- **v1.2.0 (2026-07-14):** Registered items 3-7, migrated from duplicate tracking that had been
  created in `ENGINEERING_BOARD.md` and `engineering/governance/vs031_completion_report.md` before
  this canonical register was discovered to already exist — see
  `engineering/governance/vs031_completion_report.md` for the discovery note. Most significant:
  item 3, a systemic 26-file violation of the i18n Rule 2 declarative-UI architecture principle.
- **v1.1.0 (2026-07-05):** Registered TD-003 regarding redundant idempotency logic in Activate/Pause handlers.
- **v1.0.0 (2026-07-04):** Formatted log structure and registered the hybrid ES module compiler warning.
