# Engineering Board

Version: 1.64.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-19

---

## Current Epic

**Product Polish / Stabilization: `Complete` (2026-07-19), user-declared cycle close.** Everything
since ADR-022 — Theme Audit, Quick Capture consolidation, Habit Detail, Task Detail, `/tasks` screen
removal, Reminder Engine (Story 4), `estimatedMinutes`/`dueDate`+time exposure, Calendar, Forms
consolidation, `SelectableField`, `ChoiceGroup`, the Domain Exposure Verification principle, and the
whole Task Capability Completion epic — is now closed as one cycle. User's own framing: "casi todas
las mejoras fueron estructurales, no solo funcionales." No new stories of this kind open without a
real bug forcing one; see the Working Principles section below for the standing discipline going
forward. **ADR-023 (Habit↔Commitment Relationship): ✅ Decided (2026-07-19)**, greenlit and resolved
same day — user corrected the working name from "Habit Lifecycle" to its original ADR-022 §12
scoping. Domain review (`docs/03-architecture/habit_commitment_relationship_review.md`) found **no
relationship exists in any layer** — reframing this from "formalize edge cases" (ADR-022's shape) to
"decide whether to introduce it at all." **Decision: weak association, not ownership** — a Habit may
optionally support 0..n Commitments (`Habit.commitmentIds[]`, mirroring the already-shipped
`Goal.commitmentIds[]`/`Goal.habitIds[]` pattern from ADR-021), additive to and non-exclusive with
`Habit.goalId` (unlike `Task`'s Goal-or-Commitment exclusivity, since a Habit's long-lived, identity
nature doesn't share Task's single-plan scoping). No cascades, no ownership, no shared lifecycle;
Commitment's activation invariant stays "≥1 Task," formally excluding Habit rather than leaving it
deferred. Full reasoning: `docs/03-architecture/adr_023_habit_commitment_relationship.md`. Model
decided only — implementation (the field, commands, UI) not built, a separate future story if
prioritized. User's own explicit rejection of Option 3 (mirroring Task's ownership pattern) is itself
a Domain Exposure Verification-style catch: analogy to a successful prior pattern isn't evidence the
same pattern fits a domain concept with a genuinely different nature. Implementation deliberately
**not** prioritized — triggers when a real use case needs it (surfacing supporting habits on a
Commitment's own detail, suggesting relevant habits at Commitment creation, richer Analytics), not
before.

**Consolidation cycle closed (2026-07-19): Product Polish/Stabilization, Task Capability Completion,
Design System (`SelectableField`/`ChoiceGroup`), ADR-023 — all done.** User's own read of the
project's current state: architecture solid enough to shift focus back to product capabilities.
**Standing direction for the next cycle: prioritize product-facing capabilities (new user-facing
experiences), not infrastructure/consolidation work, unless a real Critical/blocking tech debt item
forces otherwise.** This doesn't reopen or weaken the Working Principles below — verify-first,
extend-before-duplicate, and fix-in-the-shared-component still apply to whatever product work comes
next; it's a statement about _what kind_ of work to prioritize, not how to do it.

## Current Phase (2026-07-15)

**Design System Adoption**, resumed at Goals per explicit user direction (2026-07-15) — the earlier
"VS-032 planning is blocked on Stabilization & Product Audit completing" gate below is superseded,
not fully satisfied. Status verified against code, not restated from memory:

- Audit's sole **Critical** (P1/TD-8, invisible submit buttons) — **fixed, verified**.
- TD-015 (no interactive element Tab-reachable on web) plus 2 same-day follow-up regressions —
  **fixed, verified** (216/216 design-system tests, live keyboard-only Playwright pass).
- P3/TD-9 (Badge/Chip primitive) — **fixed, verified** (2/3 call sites; 3rd is dead code).
- **4 High findings still open, tracked not blocking:** P2 (duplicated titles), P4 (Tasks
  interaction pattern), P5 (Goals text truncation), A1/TD-10 (Goal aggregate has no backend
  module). Medium/Low findings untouched.
- Full evidence: `engineering/governance/architecture_product_audit_2026Q3.md` v1.1.0,
  `TECH_DEBT.md` v1.14.0.

New high-level docs (Product Capability Map, Bounded Context Map, Dependency Roadmap) remain paused
— that pause was about sequencing those docs after stabilization evidence existed, not about the
Critical/High count, and wasn't part of what this direction re-opened.

## Working Agreement for Design System Adoption (effective 2026-07-15)

Platform stabilization (Theme Engine, Accessibility, Keyboard Navigation, Tamagui compatibility,
tokens, i18n, Design System foundation) is treated as **done** going forward — not re-audited
per screen. During screen-by-screen adoption, only stop and open a new stabilization pass for:

- functional regressions,
- data loss,
- architectural violations that span multiple features (not a single screen),
- WCAG AA accessibility failures,
- or Critical-severity technical debt.

High/Medium findings that don't block the current screen's implementation get logged in
`TECH_DEBT.md` and work continues — they do not each trigger their own mini-phase. This
supersedes the more conservative "stop-and-report on any new architectural finding" default this
project has otherwise followed, specifically for this adoption phase; the underlying
document-first/don't-silently-fix discipline still applies to whatever does get logged.

### Adoption scope per screen (effective Goals onward, 2026-07-15)

Each screen's adoption pass is a **product experience review**, not a component-swap exercise:

- Adopt a Design System component only where it genuinely removes duplication or increases
  consistency — never to move an adoption-percentage metric.
- Keep the existing architecture unless a Critical violation appears.
- Review, per screen: visual hierarchy, navigation flow, primary CTA, empty states, populated
  states, Demo Mode, spacing, typography, text truncation, responsive behavior, dark/light themes,
  accessibility, keyboard navigation, and consistency with the screens already adopted (Today,
  Coach, Calendar).

### Checkpoint format addition: auditable scorecards (effective Goals onward, refined 2026-07-15)

Every screen/capability checkpoint from Goals forward ends with these blocks, in addition to the
standard checkpoint report format. Each is auditable — a reader should be able to check every line
against evidence in the checkpoint, not take a summary percentage on faith.

**Design System adoption** — a component-by-component checklist, not a bare percentage:

```text
Design System

<ComponentName>       ✔ / ✖
<ComponentName>       ✔ / ✖
...

Legacy Components      <count>
Justified               <count>   (deliberately not migrated — reason given per item)
Remaining Debt          <count>   (should be migrated but wasn't — logged in TECH_DEBT.md)
```

**Findings** — counted, not narrated inline with fixes:

```text
Findings          <count>
Fixed             <count>
Deferred          <count>   (logged in TECH_DEBT.md, not fixed this pass)
Regressions       <count>   (should always be 0 — if not, this is the first line of the report)
```

**Production Readiness** — unchanged structure, plus a `Confidence` line: even a screen/capability
that passes every check can still be `Medium` confidence if it hasn't had real usage time yet —
this is a distinct signal from the grades above, not redundant with them.

```text
Production Readiness

Arquitectura      <grade>
UX                <grade>
Visual Design     <grade>
Accesibilidad     <grade>
Performance       <grade>
Design System     <percent>%
Deuda restante    <Baja/Media/Alta>
Confidence        <High/Medium/Low>

Ready for Production: <Sí/No>
```

### Capability-level scope (effective Habits onward, 2026-07-15)

Starting with Habits, a checkpoint audits the **whole capability**, not just its primary screen's
UI — Habits isn't "a screen," it's create/edit/complete/reminder/recurrence/schedule plus its
integration surface (Calendar, Coach, Goals linkage, Insights, Demo Mode widgets). A capability
isn't production-ready just because its main screen adopted the Design System while its edit form
or its Calendar-rendering path didn't get looked at.

**Feature Completeness** — one line per lifecycle stage/integration point, adapted to what the
capability actually has (not every capability has all of these):

```text
Feature Completeness

Create        ✔ / ✖
Read          ✔ / ✖
Update        ✔ / ✖
Delete        ✔ / ✖
Complete      ✔ / ✖
Reminder      ✔ / ✖
Calendar      ✔ / ✖
Coach         ✔ / ✖
Insights      ✔ / ✖
Demo Mode     ✔ / ✖
```

**Cross-feature consistency** — how this capability's presentation compares against the
already-adopted screens, since the goal is one coherent product, not isolated screens:

```text
Cross-feature consistency

Calendar     <grade/Pending>
Goals        <grade/Pending>
Coach        <grade/Pending>
Today        <grade/Pending>
Insights     <grade/Pending>
```

### Mandatory functional audit before "Ready for Production: Sí" (effective 2026-07-16)

Established after a real incident on Tasks (2026-07-16): a checkpoint had verified domain logic,
CQRS wiring, and persistence via Playwright, and reported `Ready for Production: Sí` — but the
primary "New task" button was never actually clickable on web (a stacking-context bug), and the
demo repository's mutations weren't visible in the UI without an unrelated re-render (a
referential-equality bug). Both were real, user-facing, and neither typecheck, unit tests, nor the
Playwright checks already run had caught them, because none of those checks pressed the actual
button a user would press first.

**No capability may report `Ready for Production: Sí` on the strength of typecheck + unit tests +
Playwright screenshots/text-assertions alone.** Before that line is written, the checkpoint must
verify all five of the following — an objective checklist, not a summary judgment call (refined
2026-07-16 per user direction):

1. **Integridad arquitectónica** — `tsc --noEmit` clean, unit/domain test suites passing. (What the
   prior, insufficient checkpoints already did — necessary, not sufficient on its own.)
2. **Experiencia funcional completa** — every primary CRUD action (Create/Read/Update/Delete/
   Complete, as applicable) exercised via a **real click** on the actual control a user would use —
   not `force: true`, not a direct API/repo call standing in for the UI action.
3. **CTA principal alcanzable** — at least one check of whether the primary entry point is actually
   reachable at its visual position (`document.elementFromPoint()` at its center, or equivalent) —
   visible in a screenshot is not sufficient proof it's clickable; an overlapping floating element
   can win the hit-test while rendering underneath visually (exactly what happened to Tasks' FAB).
4. **Actualización inmediata sin refrescos manuales** — after each action, confirm the result is
   visible immediately, without an unrelated interaction (switching tabs, reloading) papering over a
   stale view. In-app navigation only when verifying state persistence across screens —
   `page.goto()` to a different route is a full reload and silently resets demo-mode's in-memory
   state, which can either mask a real bug as a false pass or manufacture a false failure.
5. **Sin regresiones de accesibilidad** — the capability's a11y posture (keyboard reachability,
   labels, WCAG AA contrast where applicable) hasn't regressed versus its last verified state; this
   is a re-check, not a full new audit, unless the pass touched interactive-element structure.

If this audit finds a blocking functional bug, it is fixed (with a root-cause diagnosis, not a
surface patch) and the audit is re-run before the capability is marked done — see
`TECH_DEBT.md`'s "Resolved Issues — Lessons Learned" section for the reference incident and the
two architectural rules it left behind. The Tasks audit (2026-07-16) is the template for this
checklist going forward, not just its origin story.

### UI Freeze — all 9 VS-032 screens (Today, Coach, Calendar, Goals, Habits, Tasks, Insights, Profile, Appearance) — effective 2026-07-16, Appearance added same day as the closing screen

All 9 screens have now passed a full functional audit (5-point checklist, Tasks/Insights standard)
and are `Ready for Production: Sí`. **VS-032 is formally `Closed`** — the freeze now covers the
entire adopted surface and stays in effect until the Product Polish Sprint explicitly starts, at
which point it lifts (Product Polish's whole purpose is to touch these screens again, deliberately).

**Until Product Polish starts, changes to these 9 screens are allowed only for:**

- bugs (functional or visual),
- accessibility,
- performance,
- or an explicit Product Polish Sprint decision once that sprint is actually underway.

**Not allowed under the freeze:** incidental style/layout changes discovered while working on
something else, new components adopted "since we're in there," or scope creep from an unrelated
fix. Shared-primitive bug fixes remain the one standing exception (the `AppScreen` background fix —
`TECH_DEBT.md` RI-3 — and the `ThemePreviewCard` accessibility fix — RI-7 — are both precedent:
fixing the primitive is in scope even though its effect ripples into frozen screens, but that's not
license to also restyle unrelated details in the same pass).

Three items are explicitly logged as deferred-not-forgotten for Product Polish: `TECH_DEBT.md`
Item 26 (Insights stat-card affordance — 3 valid options, needs a product decision), Item 25
(chip-tab selector primitive candidate, watching for a 3rd consumer), and Item 28 (Appearance's
"Alto contraste" setting has no real effect — implement for real or remove).

### VS-032 — Final Evaluation (2026-07-16, user/Principal Architect closing assessment)

```text
Arquitectura         A    Single reusable component system, single accessibility adaptation
                           point (toPlatformAccessibilityProps), consistent domain/CQRS/UI/Demo
                           Mode separation, real (not cosmetic) de-duplication, ADRs aligned with
                           code. Long-tail return on this investment.
Calidad del proceso  A+   The bigger change vs. sprint start was methodological, not code: early
                           checkpoints claimed "verified" and then real bugs surfaced (FAB,
                           refresh, keyboard nav). The process now requires evidence, RCA,
                           functional verification, documentation, governance sync before a
                           checkpoint closes — that discipline is worth as much as the code.
UX                    A-   Remaining gaps (Items 26-28) are exactly what belongs in Product
                           Polish — they affect perception, not function. Correct prioritization,
                           not a shortfall.
```

Product Readiness: Dominio ✅ · Backend ✅ · CQRS ✅ · Design System ✅ · Accesibilidad ✅ ·
Demo Mode ✅ · Navegación ✅ · Temas ✅ · Arquitectura ✅ · UX Premium 🟡 (Product Polish).

### Milestone: Product Polish (effective 2026-07-16 — VS-032's closing evaluation)

Deliberately **not** named `VS-033` — per user direction at VS-032's close, this milestone measures
something categorically different from every prior VS-032 checkpoint, and a `VS-###` label would
imply it's more of the same. `VS-033` (Reminder Settings) keeps its own number, untouched, later in
the roadmap.

**Three explicit freezes, on top of the UI Freeze above, effective until this milestone is scoped:**

1. **Domain freeze** — no new aggregates, no new entities. Bugs only.
2. **Design System freeze** — no new components unless a Critical bug requires one. Refinement of
   existing components only.
3. **Navigation freeze** — no screens move, no flows change. Polish only, on what already exists.

**What this milestone does NOT measure** (VS-032's own metrics, now retired for this phase): bugs
closed, components migrated, screens adopted. Those measured whether the product was **built
correctly** — VS-032's job, now done (see VS-032 Final Evaluation below).

**What this milestone measures instead** — whether the product **feels exceptional**: time to
complete frequent tasks, visual consistency, premium perception, microinteractions, animation
quality, copy quality, onboarding, delight, fine-grained accessibility (beyond AA pass/fail),
perceived performance.

**Guiding question for every decision in this milestone** (user's framing, verbatim): stop asking
_"¿qué pantalla sigue?"_ — start asking _"¿qué haría que Commitment pareciera una aplicación de
Apple, Notion o Linear?"_ Reinforces the product vision's existing Linear/Notion/Rise bar (see
`docs`/memory on product vision) with a concrete new framing at the point this milestone opens.

Carries forward the 3 items already deferred here: `TECH_DEBT.md` Item 26, Item 25, Item 28.

**Full definition — Five Pillars (Motion/Visual Language/Interaction/Content/Delight, each with a
formal Objetivo + rule categories as of v1.2.0), the working `Principios` list, and the audit
methodology: `PRODUCT_POLISH_GUIDE.md`** — an experience document, not a technical one. Its
methodology section specifies every audit logs findings on two separate dimensions — **Bugs**
(fixed same-session, same discipline as any functional bug) and **Memorable Moments** (logged,
triaged against the Pillars, never fixed ad hoc) — and closes with two scorecards: a **Product
Polish Score** (grade per pillar + Overall Premium Score) and a **Memorable Moments** list
(✓ existing / Opportunities). The question every audit answers is not "any defects left?" but
"does this leave an impression matching the quality bar?"

**Concrete rules the Pillars grade against — `COMMITMENT_EXPERIENCE_GUIDE.md` (new, v1.0.0)**,
Commitment's own Human Interface Guide: real spacing/padding/card-vs-list-vs-hero rules, a
3-question hierarchy test, element/action/typography density caps, voice/copy principles with
concrete examples, real millisecond motion values, per-color emotional meaning (resolves the first
audit's red-deltas finding), and a haptic/sound taxonomy. **No further screen audits happen until
this document exists — it now does**, so the next audit under this milestone is the first with a
stable, comparable standard instead of a fresh judgment call each time.

**Design System freeze — two explicit, scoped exceptions exercised this session (2026-07-19), not
violations:** `SelectableField` (date/time field affordance — see the "Independent Date/Time Fields"
entry above) and `ChoiceGroup` (segmented choice chips, `TECH_DEBT.md` Item 44) are both new
components. Both qualify under the freeze's own carve-out — `SelectableField` fixed a genuinely
Critical bug (the web date/time field was a fully dead button, not just unpolished); `ChoiceGroup`
was scoped and explicitly directed by the user as "the last Product Polish work" specifically to
avoid it becoming an open-ended refactor — migrated exactly 4 identified call sites, nothing else
(`FilterChip`, `ControlledSelect`, and `TaskForm`'s raw `Select` picker were explicitly left alone).
Both are visual-consistency/affordance fixes, not new product surface — in scope for a Product
Polish milestone whose whole purpose is exactly this category of work, even under an active freeze.

## Working Principles (Commitment's standing discipline, formalized 2026-07-19)

User's own closing framing for the Product Polish/Stabilization cycle above: this set of habits
"ha demostrado ser efectivo durante todo el epic Task Capability Completion y vale la pena
convertirlo en la forma habitual de trabajar en Commitment" — not cycle-specific practice, the
default going forward, starting with ADR-023.

1. **Verify first** that a capability doesn't already exist in the domain before adding anything —
   see "Domain Exposure Verification" immediately below; the principle that started this list.
2. **Extend before duplicating.** Before building a new mechanism, check whether an existing one
   (a port, a service, an event-handler pattern) already generalizes to the new case — Story 4
   (`ReminderSourceType('task')`) is the model: the Reminder Engine was already fully source-agnostic,
   the only real gap was a closed type union and wiring, not a new engine.
3. **Fix in the shared component, not the screen.** When a bug or inconsistency traces back to a
   component reused across features, fix it once there — `SelectableField`/`ChoiceGroup` both
   started as a Task-specific ask and were built as design-system primitives instead, so the fix
   propagated to Habit/Commitment automatically, verified without touching either screen's code.
4. **Document governance only when a real decision changes**, not per implementation detail. Version
   bumps and changelog entries earn their place when they record an actual architectural or scoping
   decision (a new epic, a closed item, a reversed choice) — not routine restating of what code
   already shows.

## Working Principle: Domain Exposure Verification (effective 2026-07-19)

Registered after the Task Domain Review (`docs/03-architecture/task_domain_review.md`) found that
`estimatedMinutes`, `actualMinutes`, `dueDate`, and `startDate` were all already fully modeled on
the `Task` aggregate — with working behavior methods and their own domain events — while a product
proposal was independently arriving at the same fields as "new" attributes to add. The domain
design was correct from the start; the gap was that nothing above the aggregate (API commands,
mobile models, UI) exposed what already existed.

**Before adding a new attribute to a domain aggregate, verify whether the capability already
exists and only needs exposing through the upper layers (API, mobile model, UI).** Check the
aggregate itself, not just the read models or the client — a field can be fully modeled and still
invisible everywhere it would need to be to matter. This is a large-enough codebase now that
skipping this check produces real duplicated work, not just redundant documentation.

Directly reinforces the Product Polish milestone's existing **domain freeze** ("no new aggregates,
no new entities — bugs only," see below): most of what looks like a domain-change request turns
out to be an exposure gap once actually checked against the aggregate, satisfiable without touching
`packages/domain` at all.

## Design Principle: Independent Date/Time Fields (effective 2026-07-19)

Registered after exposing `dueDate`'s time-of-day precision (Task Capability Completion's
post-closure follow-through, above): **wherever the app lets a user pick a date and a time
together, they must be two independent, separately-labeled, separately-editable fields — never one
combined "date and time" control.** Both map onto the same underlying value (e.g. `dueDate`), so
this is a UI-composition rule, not a new domain attribute anywhere it applies.

Rationale: users decide the day first, then (optionally) the time, as two separate mental steps;
independent fields let either be changed without touching the other, and make "no time set" an
explicit, visible state (e.g. "Sin definir") rather than an ambiguous midnight value or a hidden
field. `apps/mobile/src/shared/lib/mergeDateAndTime.ts` is the shared helper two sibling pickers use
to combine their independent edits back into one `Date` — reuse it rather than re-deriving the
merge logic per form.

**Scope, Task-specific parts:** implemented for Task (`TaskForm` create/edit, `TaskDetailScreen`, and
Calendar's chronological-then-"Sin hora" grouping — see the epic entry below for detail). Calendar
Events and future Focus Sessions have no scheduling UI to fix yet — registered here as the standing
rule for whenever that UI gets built, not implemented against anything now.

**Honest note on churn:** earlier in this same work, `PlainDateTimePicker` was extended with a
combined `mode="datetime"` (plus real Android two-step dialog chaining to make it actually correct
cross-platform) to expose `dueDate`'s time-of-day in a single field. This design principle reverses
that specific choice in favor of split fields — the combined-mode code (and its Android chaining)
was removed again in the same pass once the principle was set, rather than left as unused dead code
alongside the new split-field implementation.

### Cross-app affordance fix (2026-07-19, same day) — user's follow-up after seeing the split fields

The split Fecha/Hora fields still failed a more basic test: they didn't look editable — no border, no
background, no icon, no chevron, indistinguishable from a static label — and the same bare-button
pattern existed on every screen using either base component, not just Task. Treated as a Design
System fix, not a per-screen patch, per explicit instruction.

**Audit (exactly as requested):**

- **Consumers found:** exactly 4 — `TaskForm.tsx`, `ReminderSection.tsx` (both Task, via
  `PlainDateTimePicker`), `CommitmentForm.tsx`, `HabitForm.tsx` (both via `ControlledDatePicker`). No
  other date/time picker implementation exists anywhere in the app — confirmed by grepping for both
  `PlainDateTimePicker`/`ControlledDatePicker` and any other `DateTimePicker` import across
  `apps/mobile/src`.
- **Base component modified:** two, matching the audit above exactly —
  `apps/mobile/src/shared/forms/PlainDateTimePicker.tsx` and `ControlledDatePicker.tsx`. Both now
  delegate their visual/interaction chrome to a new, generic, public design-system primitive,
  **`SelectableField`** (`packages/design-system/src/components/SelectableField.tsx`, exported from
  `@commitment/design-system`) — a labeled, bordered, iconed, chevron-having, fully-stateful
  (hover/press/focus/disabled, via the same `useInteractionState`/`FocusRing`/`useHapticBehavior`/
  `useInteractionAnimation` wiring `Input`/`Button` already use) pressable row. Deliberately named and
  scoped generically, not date-specific — the same "todo campo que abra un selector debe compartir el
  mismo patrón visual" rule the user stated applies to color/icon/priority/goal selectors too, so this
  is the one place that pattern will live when those get built, not a second bespoke component later.
- **Screens that inherit the fix automatically:** all 4 consumers above, confirmed live via
  Playwright screenshots without editing any of their screen-level code — `TaskForm` (create/edit),
  `ReminderSection`'s narrower side-by-side custom date/time pair, `CommitmentForm`'s "Fecha objetivo",
  and `HabitForm`'s "Hora del recordatorio" all show the identical bordered/iconed/chevroned field the
  moment the two base components were fixed. This is the direct, verified payoff of there being
  exactly 2 reusable base components already, not 6 separate implementations.
- **Screens still using their own implementation:** none found. The audit's premise (patching
  screen-by-screen would be wrong because a shared component already exists) held exactly — there was
  no third, undiscovered date-picker implementation anywhere to worry about.
- **Deprecated:** nothing formally deprecated; the combined `mode="datetime"` support added and then
  reverted earlier the same day never shipped as a real API surface, so there's nothing left pointing
  at it to deprecate.

**Web (TECH_DEBT.md Item 43, now resolved):** both components now render a real, fully transparent,
absolutely-positioned native `<input type="date">`/`type="time">` inside the `SelectableField` row on
web — clicking anywhere on the row opens the browser's actual native picker (no dead button); the
visible text still shows the app's own locale-formatted value, not the native input's own rendering.
Verified live: setting a date via the native input updates `SelectableField`'s displayed text
immediately (including its focus-ring styling, which picks up the inner input's real DOM focus via
React's bubbling `onFocus`/`onBlur` — no extra wiring needed), saves, and round-trips correctly
through `TaskDetailScreen`.

**Android:** kept the existing Fecha→Hora-as-two-separate-taps flow (each field is now its own
`SelectableField` row with its own tap target, so there's no longer even a two-step-within-one-field
chaining concern — that was only needed for the reverted combined-mode picker).

**iOS:** left `display="default"` (already a compact, native, tap-to-open control — not an
always-expanded wheel, confirmed from the library's own type definitions rather than assumed) _outside_
`SelectableField`'s own border/background, sharing only the `Label` typography above it. Wrapping an
already-native-chrome iOS control in a second custom border risked looking broken/nested with no way
to verify on a real device or simulator in this environment — the conservative, non-overreaching
reading of "keep the most appropriate native behavior."

**Verification status, per platform** (user's own correction — code review and reasoning about the
library's type definitions is not the same claim as having seen it render):

- **Android ✅ verified** — `tsc --noEmit` clean, mobile Jest at baseline, and the underlying
  `SelectableField` row/press mechanics are identical to what's already live-verified on web.
- **Web ✅ verified live** — Playwright screenshots of all 4 consumers, plus a full save round-trip
  (date + time set via the native web `<input>` → saved → correctly displayed on Detail).
- **iOS — pending device verification.** `display="default"`'s compact-control behavior is asserted
  from the library's own type definitions (`IOSDisplay = 'default' | 'compact' | 'inline' |
'spinner'`), not observed — no simulator or device available in this environment. Not blocking
  (the change is additive — a `Label` above an untouched native control — and low-risk), but not
  claimed as "closed" until someone actually sees it on iOS.

## Priorities

- **Epic: Task Capability Completion — `Closed` (2026-07-19)**, opened 2026-07-19, closed the
  Stabilization Sprint — see `PROJECT_STATUS.md` v1.69.0. Direct output of the Task Domain Review:
  `estimatedMinutes`, `actualMinutes`, `dueDate`, and `startDate` are already real `Task` aggregate
  fields with working behavior methods (`estimate()`, `schedule()`) — this epic connects them through
  the layers that don't expose them yet. All 6 stories done (Story 5's UI presentation deliberately
  spun out to the new, separate **Insights / Analytics** epic in `ROADMAP.md` rather than blocking
  this epic's closure). Two small, deliberate domain touches across the whole epic, both flagged in
  advance rather than silent — widening `ReminderSourceType`'s closed union (Story 4) and enriching
  `TaskDueDateChangedEvent`'s payload with `identityId` (Story 4's own bug fix) — neither adds a new
  domain concept, verified against the aggregate before scoping either time, per the Working
  Principle above.
  - **Story 1 ✅ (2026-07-19):** Exposed `estimatedMinutes` in `TaskForm` (create and edit) via a
    new, deliberately reusable `DurationInput` component (`packages/design-system` — presets 15/30/
    45/60/90/120 min + Custom, meant for Focus Sessions/Habits/Calendar/Coach later too). Shown
    discreetly on `TaskCard` and in `TaskDetailScreen`'s info block. Found and fixed a real,
    pre-existing bug along the way: `TaskForm.tsx`'s save path never invalidated the React Query
    cache after an edit (title/description/priority/relations were all silently affected, not just
    this new field) — Detail screens showed stale data for up to the client's 5-minute `staleTime`.
    Zero `packages/domain` changes. Deliberately did not add domain/backend min/max validation
    (none exists yet in `task-constraints.ts` or the backend's Zod schemas) — presets bound the
    common case, Custom clamps client-side only as a UX guardrail, domain stays the source of truth.
  - **Story 2 ✅ (2026-07-19, satisfied — no code needed):** "Show `estimatedMinutes` as calendar
    block duration in the day agenda" — verified live and found this capability **already shipped**,
    predating this whole sprint (`calendar.tsx`'s `{item.durationMinutes && ...}` render, commit
    `a0e865d`). Corrects this backlog entry's own original claim ("nothing renders it yet") — that
    was wrong, written without checking `calendar.tsx` closely enough at review time. Exactly the
    failure mode the Domain Exposure Verification principle exists to catch, and it caught it before
    any code was written. The bigger "reserve a proportional visual time-block, 2:15 PM → 3:00 PM"
    idea from the epic's founding conversation is explicitly **not** in this epic's scope — moved to
    a new **Calendar 2.0 / Time Blocking** entry in `ROADMAP.md` (Status: Future, not started; a
    proportional hour-by-hour grid is a different UI paradigm from this epic's exposure work, not a
    small wiring task).
  - **Story 3 ✅ (2026-07-19):** Added `ScheduleTaskCommand` (command → `ScheduleTaskCommandHandlerCore`
    → NestJS handler → `TaskApplicationService.scheduleTask()` → `PATCH /v1/tasks/:id/schedule`),
    wrapping the existing `Task.schedule()` — the one genuine backend gap this epic found, confirmed
    exhaustively absent before building anything, per the Working Principle above. `dueDate`/`startDate`
    are explicit `string | null` (never `undefined`) end to end, matching `relinkGoal`/`relinkCommitment`'s
    own explicit-null convention. `TaskForm`'s "Fecha límite" field is now editable in edit mode, not
    just create (previously showed a locked hint); `save()` reschedules only when the value actually
    changed. **Verified against the real backend, not just demo mode:** curl round-trip — create
    (`dueDate: 2026-08-01`) → `PATCH .../schedule` (`dueDate: 2026-09-15`, `204`) → `GET` confirms the
    new date and `version` incremented 1→3, proving the event was applied through the real command bus.
    Backend `tsc --noEmit` clean, 109/109 Jest passing. Mobile `tsc --noEmit` clean. Live Playwright
    walkthrough (Goals → Tareas → task detail → overflow menu → Editar) confirmed the field renders
    editable and pre-filled; the actual click-to-change-date interaction hit a **pre-existing, unrelated**
    web-platform gap (`TECH_DEBT.md` Item 43 — `ControlledDatePicker`/`PlainDateTimePicker` open no
    picker on Expo web, confirmed to already affect Habit/Commitment forms too, predates this session)
    — closed that gap in verification with two new `demoTasksRepository.schedule()` unit tests instead
    (including a regression guard for a `dueDate ?? undefined` bug caught and fixed in code review
    before it shipped, which would have silently turned "clear the date" into "don't touch it").
    **Story 3 formally closed, 2026-07-19:** backend flow verified end to end for real, the one real
    bug found is fixed and covered, and the sole remaining gap is a Design System / forms concern —
    not a `ScheduleTaskCommand` defect — so it's deliberately not being fixed inside this story. Split
    out to its own **Cross-platform Date Picker Parity (Web / iOS / Android)** epic in `ROADMAP.md`
    (Status: Future) rather than mixed into Task Capability Completion, same reasoning as Story 2's
    Calendar 2.0 split.
  - **Story 4 ✅ (2026-07-19):** Domain Exposure Verification confirmed first (per the user's explicit
    ask): the `Reminder` aggregate and its ports are already fully source-agnostic — zero branching on
    `sourceType` anywhere — so the only closed piece was the `ReminderSourceType` union itself, not a
    hidden config/registry mechanism. Widened it to `'commitment' | 'habit' | 'task'` and wired Task
    into the same automatic, event-driven pattern Commitment already uses (simpler than Habit's — no
    recurrence, so no dedicated scheduling service needed): `ScheduleReminderOnTaskRegisteredHandler`
    (on `TaskRegisteredEvent`), `RescheduleReminderOnTaskDueDateChangedHandler` (on
    `TaskDueDateChangedEvent`, fired by Story 3's `ScheduleTaskCommand` too), and
    `CancelReminderOnTaskCompletedHandler`/`CancelReminderOnTaskCancelledHandler`. **Scoped
    deliberately to the automatic wiring only** — did not build the opt-in "Activar recordatorios"
    toggle endpoint the mobile Task Detail UI already shows, since neither Habit nor Commitment has a
    precedent for that interaction (both are always-on), and inventing one unilaterally (default
    behavior, preset offsets) would be a product decision, not an architecture-extension one. Flagged,
    not built. **Found and fixed a real bug during live verification:** the due-date-changed handler
    initially called `scheduler.reschedule()`, which no-ops if no reminder exists yet — meaning a task
    created _without_ a due date that later got one (via edit or Story 3's schedule) would silently
    never get a reminder. Fixed by using `scheduler.schedule()` (create-or-update) instead, which
    required adding `identityId` to `TaskDueDateChangedEvent`'s payload (the aggregate already had it;
    a payload enrichment, not new domain concept) since `schedule()` needs it to create a Reminder from
    scratch. **Verified against the real backend**, not demo mode — 5 scenarios via curl against the
    running server, cross-checked against `InMemoryReminderScheduler`'s own log output: register-with-
    due-date → `Scheduled`; reschedule via Story 3's endpoint → `Scheduled` (updated); clear the due
    date → `Cancelled`; register-without-then-add-later → `Scheduled` (the bug fix, re-verified);
    cancel task → `Cancelled`. `packages/domain` 268/268 Jest passing, backend 109/109, mobile 86/86 —
    all three `tsc --noEmit` clean.
  - **Story 5 ✅ data layer, ⏸ UI presentation deferred (2026-07-19):** Added `plannedMinutes`/
    `completedMinutes`/`remainingMinutes`/`completionRatio` to `DailyMetricsPoint` and
    `totalPlannedMinutes`/`totalCompletedMinutes`/`totalRemainingMinutes`/`completionRatio` to
    `WeekWindowMetrics` (`packages/domain/src/insights/InsightsContext.ts`), computed in
    `daily-metrics.ts`'s `computeDailyMetrics`/`aggregateWeek`. Both `planned` and `completed` are
    scoped by `Task.dueDate` (not `completedAt`, which the existing `focusMinutes` uses) — the same
    population `productivity` already uses, so the two numbers are directly comparable ("of what I
    committed to today/this week, how much did I actually get done"), not a redundant duplicate of
    `focusMinutes` (which answers "how much time did I spend," a different question).
    `remainingMinutes`/`completionRatio` are pure derivations, computed eagerly. **Found and fixed a
    design bug before it shipped:** the week-level sums were initially built by summing
    `dailyMetrics`' per-day values, but `dailyMetrics` only covers the trailing 14 days ending today
    — days later in the current week (e.g. Thu-Sun when today is Wed) have no point in that series
    at all, so the sum silently under-counted the current week's planned minutes. Fixed by scoping
    `totalPlannedMinutes`/`totalCompletedMinutes` the same way `productivity` already correctly does
    — scanning `tasks` directly by `dueDate` within the window, not summing `dailyMetrics`. Verified:
    `packages/domain` 268/268 and mobile 90/105 (86 baseline + 4 new tests; 15 failures are the same
    pre-existing, unrelated `__DEV__` issue) Jest passing, both `tsc --noEmit` clean. **UI
    presentation deliberately deferred** — asked the user how to surface "comprometido vs completado"
    given the Insights Overview is documented as a fixed 4-card layout; user's call: leave this a
    product/UX decision for a future Insights/Analytics epic (see `ROADMAP.md`), not an incidental
    consequence of this data-layer story. The data is fully available for Coach/Analytics/Calendar to
    consume today regardless of when/whether the Overview itself changes.
  - **Story 6 ✅ (2026-07-19):** Domain Exposure Verification confirmed the gap was real and total:
    backend `TaskView` already returns `startDate`/`tags`/`metadata` in every response, and the
    backend already accepts `tags`/`metadata` on both register and edit, `startDate` on Story 3's
    schedule endpoint — zero backend/domain changes needed, purely mobile-side plumbing. Added the 3
    fields to `TaskModel`; wired `tags`/`metadata` into `tasksApi.create()`/`edit()`. **Found and
    fixed a real, previously-shipped bug along the way:** `tasksApi.schedule()` (Story 3) only ever
    sent `dueDate`, never `startDate` — but the backend controller resolves an omitted `startDate` to
    `null` (`parsed.data.startDate ?? null`), so every reschedule was silently clearing `startDate`.
    Hadn't caused visible damage yet only because no UI has ever set `startDate` to begin with, but
    would have as soon as anything did. Fixed by making `startDate` a required third parameter,
    forcing every call site to explicitly decide; `TaskForm.tsx`'s one call site now passes the
    task's current `startDate` through unchanged (no UI to edit it yet). **Deliberately did not build
    new UI** for tags/metadata editing or a `startDate` field in `TaskForm` — nothing currently sets
    these, so there's nothing to display yet, and a tag/metadata editor is a real UI feature, not an
    exposure gap; flagged, not built unilaterally, same discipline as Story 4's reminder toggle and
    Story 5's Insights UI question. Verified: real backend round-trip via curl (tags/metadata
    create→get; the `startDate` preservation fix specifically — set both, change only `dueDate`,
    confirm `startDate` survives), `packages/domain` 268/268, backend 109/109, mobile 93/108 Jest (90
    baseline + 3 new tests; 15 pre-existing unrelated `__DEV__` failures), all three `tsc --noEmit`
    clean, Playwright smoke test confirming `TaskForm.tsx`'s edit/save path has no regression.
  - **Post-closure follow-through (2026-07-19) — `dueDate` time-of-day, not a new `scheduledAt`
    field.** User's own question, applying the same verification discipline: is `dueDate` a full
    `Date`/instant, or does the domain normalize it to midnight? Verified exhaustively — `Task.ts`'s
    `dueDate: Date | null` has zero midnight-normalization anywhere (aggregate, projectors, or
    in-memory persistence), and `build-day-agenda.ts`'s `isoTime()` already anticipated a real
    time-of-day component (its own "date-only, no real time" comment predates this work). Answer:
    **yes, already a full instant** — the date-only restriction was purely the frontend picker's
    `mode="date"`, not a domain limitation, so this closes as an exposure fix, not a new `scheduledAt`
    domain concept (which still correctly awaits its own future ADR, unchanged). Verified end-to-end
    against the real backend: creating a task with `dueDate: 2026-08-01T14:30:00.000Z` round-trips
    exactly, and — the decisive proof this actually completes Reminders/Agenda/Calendar as intended —
    the Story 4 Reminder Engine automatically scheduled the reminder at `14:30:00.000Z`, not midnight,
    with zero changes needed to the Reminder Engine itself (it already just uses `dueDate` verbatim).
  - **Split into independent Fecha/Hora fields (2026-07-19), superseding the combined picker above,
    per the new Design Principle: Independent Date/Time Fields** (see above — user's follow-up call
    after seeing the time-of-day exposure work, generalized into an app-wide rule, not Task-specific).
    `TaskForm` now renders two separate `PlainDateTimePicker`s (`mode="date"` + `mode="time"`,
    combined via the new shared `mergeDateAndTime()` helper) instead of one `mode="datetime"` field —
    the Android two-step dialog chaining built for the combined mode was removed again in the same
    pass rather than left as dead code once split fields made it unnecessary. `TaskDetailScreen` shows
    "Fecha límite" and "Hora" as two independent rows, "Hora" never hidden — explicitly "Sin definir"
    when no time is set, so the user can see why a task doesn't sort by time in Calendar rather than
    wondering if the app forgot it. Calendar (`calendar.tsx`) now visually groups items into a
    chronological "has a time" section (already correctly sorted by `buildDayAgenda`, this pass added
    the visual split) followed by a "Sin hora" section for due-date-only items — live-verified:
    habits with real reminder times sort first chronologically, due-date-only tasks group visibly
    separately under "Sin hora". `tsc --noEmit` clean, mobile Jest at baseline (93/108, same 15
    pre-existing unrelated failures), Playwright screenshots confirmed all three surfaces (form,
    detail, calendar) render per spec.
  - **Explicitly out of scope, a separate future conversation:** `energyLevel`/`location` as new
    Task attributes — genuine new domain surface, not an exposure gap, would need its own ADR when
    prioritized (see Task Domain Review's closing section).
  - **`scheduledAt` (planned execution time) — verified 2026-07-19, confirmed genuinely new, not
    implemented.** Before Story 4, checked exhaustively for an existing "when do I plan to work on
    this" concept across Task/Calendar/Habit/Commitment/Reminder, per the same verification
    principle. None exists: `AgendaItem.time` (`packages/domain/src/calendar/engine/
build-day-agenda.ts`) is derived from `dueDate`'s time-of-day component
    (`isoTime(task.dueDate)`), not a separate field — it conflates deadline and plan today.
    `Habit.reminderTime` is a recurrence-anchored notification time, Habit-specific, not a general
    scheduling concept. `Reminder.scheduledFor` is when the _notification_ fires (a delivery detail),
    not when the user plans to execute the task. Confirms the distinction the user raised
    (`startDate`=constraint, `dueDate`=deadline, `scheduledAt`=plan, `estimatedMinutes`=budget,
    `actualMinutes`=actual) is real new domain surface, same category as `energyLevel`/`location` —
    not scoped or built now, needs its own ADR-level decision (naming confirmed as `scheduledAt`, not
    `executionTime`, to avoid implying a historical/actual-occurrence record) when prioritized.

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
  `engineering/governance/vs031_completion_report.md` v2.2.0; committed as `1a3f598`/`7853f22`/
  `7cdf6cf`; not Closed)
- **VS-032:** Design System Adoption — **`Closed` (2026-07-16)**, uncommitted (informal label used
  consistently in `TECH_DEBT.md` change history since v1.4.0; formal scoping vs. ADR-016 Rule 2
  still an open decision, see `PROJECT_STATUS.md`). Structured in three blocks per 2026-07-15
  direction:
  - _Foundation_ (done, not re-audited per screen — see Working Agreement above): Theme Engine ✅,
    Accessibility ✅, Keyboard Navigation ✅, Design System Foundation ✅.
  - _Design System Adoption_ (all 9 screens ✅): Today, Coach, Calendar, Goals, Habits (first
    capability-level pass — 3 real bugs fixed, Goal-linkage gap documented as Item 18, then closed),
    Tasks (Fase 2, closed 2026-07-16 — see `PROJECT_STATUS.md`'s Tasks entry for the full
    audit-blockers-fix-reaudit sequence; `TECH_DEBT.md` "Resolved Issues — Lessons Learned"; P4's
    row-interaction redesign from the original audit is still separately open, untouched by this
    pass), Insights (closed 2026-07-16 as a full product audit per user direction — functional/
    UX/domain/Design System/accessibility, not just component adoption; found and fixed an
    `AppScreen`-level background bug affecting all 12 consumers, not just Insights, plus 2 open UX
    findings left for a product decision), Profile (closed 2026-07-16 — found and fixed the screen
    always showing the demo identity even with Demo Mode off, see `TECH_DEBT.md` RI-6/Item 27),
    **Appearance** (closed 2026-07-16 — the tightly-scoped closing checkpoint: verified 4 themes,
    persistence, Preview, Demo Mode independence, Reduced Motion; found and fixed a screen-reader
    accessibility gap in the theme picker, see `TECH_DEBT.md` RI-7; found and logged, not fixed,
    "Alto contraste" having no real effect, see Item 28).
  - _Product Polish_ (active milestone as of 2026-07-16): UX, Animations, Responsive, Empty states,
    Demo Data, plus the 3 deferred findings from the UI Freeze section above.

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

- **v1.64.0 (2026-07-19):** **Consolidation cycle formally closed.** Product Polish/Stabilization,
  Task Capability Completion, `SelectableField`/`ChoiceGroup`, ADR-023 — user's own assessment: done,
  architecture solid enough to shift back to product capabilities. Registered standing direction:
  next cycle prioritizes user-facing product work, not infrastructure, absent a real Critical tech
  debt item. ADR-023's implementation explicitly deferred until a concrete use case (surfacing
  supporting habits, suggestion at Commitment creation, richer Analytics) needs it.
- **v1.63.0 (2026-07-19):** Added "Implicaciones futuras" to ADR-023 per user review — an explicit
  boundary statement (no state sync, ownership, cascades, or Reminder/Analytics/Calendar changes
  implied by `commitmentIds[]` existing) protecting the decision from future scope-creep-by-inference.
  User's own approval highlighted the domain-precedent finding (`Goal.commitmentIds[]`/`habitIds[]`
  already existed) as the strongest part of the ADR — extending an established modeling pattern, not
  inventing an exception.
- **v1.62.0 (2026-07-19):** **ADR-023 decided: `Closed`.** User rejected mirroring Task's ownership
  pattern — a Habit's long-lived, identity-building nature doesn't share Task's single-plan scoping,
  so applying ADR-022's pattern by analogy would have been exactly the mistake Domain Exposure
  Verification exists to catch. Decision: weak association (`Habit.commitmentIds[]`, 0..n, additive
  to `goalId`, no cascades, no ownership), following the already-shipped `Goal.commitmentIds[]`/
  `Goal.habitIds[]` precedent from ADR-021. Commitment's activation invariant formally excludes Habit
  ("≥1 Task" only) rather than leaving it deferred — updated the stale doc comments in
  `Commitment.activate()` and `TaskBasedCommitmentActivationPreconditions` to match. Model only —
  no implementation. See `docs/03-architecture/adr_023_habit_commitment_relationship.md`.
- **v1.61.0 (2026-07-19):** **ADR-023 domain review complete.** Investigated Habit↔Commitment per the
  user's explicit ADR-022 §3.1/§12 successor scoping (not a Habit state-machine question). Headline
  finding: no relationship exists in any layer — domain, API, UI, Reminder Engine, Calendar, or
  Analytics. `TaskBasedCommitmentActivationPreconditions`'s own doc comment already named this gap.
  ADR-023 is therefore a "decide whether to introduce this relationship" question, not a "formalize
  existing edge cases" one like ADR-022 was. Full evidence:
  `docs/03-architecture/habit_commitment_relationship_review.md`. Awaiting direction before the ADR
  itself gets written.
- **v1.60.0 (2026-07-19):** **Product Polish / Stabilization cycle formally `Complete`** — user's own
  closure, everything since ADR-022 (Theme Audit through `ChoiceGroup`/Item 44) counted as one cycle,
  mostly structural not just functional improvement. Registered **Working Principles** — the 4-point
  discipline (verify first, extend before duplicating, fix in the shared component, document only real
  decisions) that ran through this whole cycle, now the standing default rather than cycle-specific
  practice. **ADR-023 (Habit Lifecycle) greenlit**, starting with the same discipline: domain
  investigation before any implementation.
- **v1.59.0 (2026-07-19):** **"DS-Selectable Chips" — `TECH_DEBT.md` Item 44 resolved, scoped exactly
  as directed.** New `ChoiceGroup` (`@commitment/design-system`), same interaction wiring as
  `SelectableField`. Migrated exactly the 4 identified call sites (`ReminderSection`'s 3 `ChoiceRow`s,
  `DurationInput`, `TaskForm`'s priority and relation-kind selectors) — deliberately not `FilterChip`
  or the raw Goal/Commitment `Select`, per explicit scope. Found and fixed a real rendering bug before
  shipping: `FocusRing`'s hug-content default silently collapsed equal-width chip rows. Documented
  both this and `SelectableField` as explicit, scoped exceptions to the Product Polish milestone's
  Design System freeze, not violations of it. Verified live via Playwright, all suites at baseline.
- **v1.58.0 (2026-07-19):** Corrected v1.57.0's iOS claim per user review — reasoning about the
  library's own type definitions is not the same as observed verification. iOS's `SelectableField`
  integration is now explicitly "pending device verification," not closed; Android and web remain
  independently verified as before.
- **v1.57.0 (2026-07-19):** **Cross-app date/time field affordance fix, Design System level.** New
  public `SelectableField` component (`@commitment/design-system`) — a generic, labeled, bordered,
  iconed, chevroned, fully-stateful pressable row, sharing the exact same interaction wiring as
  `Input`/`Button`. Both existing base date/time components (`PlainDateTimePicker`,
  `ControlledDatePicker`) now delegate their chrome to it, fixing the "looks like static text, not an
  editable field" problem on every platform for all 4 real consumers (`TaskForm`, `ReminderSection`,
  `CommitmentForm`, `HabitForm`) at once — verified live via Playwright without touching any of those
  4 screens' own code. Also resolved `TECH_DEBT.md` Item 43 in the same pass: web now gets a real,
  functional native `<input type="date"|"time">` instead of a dead button. iCloud sync corruption hit
  `CommitmentForm.tsx` again mid-session (4th time, restored byte-identical to HEAD as always).
- **v1.56.0 (2026-07-19):** Registered **Design Principle: Independent Date/Time Fields** — date and
  time are always two separate, independently-editable UI fields app-wide, never one combined
  picker. Implemented for Task: `TaskForm` (create/edit) now shows separate Fecha/Hora fields via a
  new shared `mergeDateAndTime()` helper; `TaskDetailScreen` shows both as independent rows, "Hora"
  explicitly "Sin definir" rather than hidden when unset; Calendar visually groups a chronological
  "has a time" section followed by "Sin hora". This reverses v1.55.0's combined `mode="datetime"`
  picker (including its Android two-step dialog chaining) — removed rather than left as dead code.
  Live-verified via Playwright: habits (real reminder times) sort chronologically first, due-date-only
  tasks group under "Sin hora" as specified. Habit/Commitment/Calendar Events/Focus Sessions
  registered as the rule's future scope, not touched this pass.
- **v1.55.0 (2026-07-19):** **`dueDate` time-of-day exposure — completes Reminders/Agenda/Calendar,
  no new domain concept.** Verified `Task.dueDate` was always a full instant, never
  midnight-normalized — the date-only picker was a frontend gap. Changed `TaskForm` to
  `mode="datetime"`; found and fixed a real Android-specific bug before shipping (the native picker
  library has no combined datetime dialog on Android, only iOS) via two-step dialog chaining in
  `PlainDateTimePicker.tsx`. Verified against the real backend — a task's due time (`14:30:00.000Z`)
  round-trips exactly and the Story 4 Reminder Engine schedules at that exact time automatically,
  with zero Reminder Engine changes needed. `scheduledAt` as a distinct domain concept still
  correctly awaits its own future ADR — this was purely exposing time-of-day precision `dueDate`
  already had.
- **v1.54.0 (2026-07-19):** **Task Capability Completion Story 6 ✅ — epic `Closed`.** Mapped
  `startDate`/`tags`/`metadata` into mobile's `TaskModel` and `tasksApi`; verified backend/domain
  needed zero changes (`TaskView` already returned all three, backend commands already accepted
  them). Found and fixed a real, previously-shipped bug: `tasksApi.schedule()` never sent `startDate`,
  and the backend resolves an omitted one to `null` — every reschedule was silently clearing it.
  Deliberately did not build new UI for tags/metadata/startDate editing (nothing sets them yet, and a
  tag editor is a real feature, not an exposure gap). Verified against the real backend, all three
  `tsc --noEmit` clean, Jest passing at baseline+3, Playwright regression smoke test clean. With all 6
  stories done, **Task Capability Completion is now `Closed`** — corrected the epic's own "zero
  packages/domain changes" claim to note its two small, flagged-in-advance exceptions (Story 4). See
  `ROADMAP.md` for the closure entry and the two spun-off future epics (Calendar 2.0, Cross-platform
  Date Picker Parity, Insights/Analytics).
- **v1.53.0 (2026-07-19):** **Task Capability Completion Story 5 — data layer ✅, UI deferred.** Added
  `plannedMinutes`/`completedMinutes`/`remainingMinutes`/`completionRatio` to `DailyMetricsPoint`/
  `WeekWindowMetrics`, both scoped by `Task.dueDate` (matching `productivity`'s existing population,
  not `focusMinutes`'s `completedAt` scoping) so "comprometido vs completado" compares like with like.
  Found and fixed a real bug before shipping: the week-level sums were initially built from summing
  `dailyMetrics`, which only covers the trailing 14 days ending today and silently excludes the rest
  of the current week — fixed by scoping directly off `tasks`, mirroring `productivity`'s own
  approach. Asked the user how to surface this in the Insights Overview (documented as a fixed 4-card
  layout); decision: leave it a future Insights/Analytics epic's product/UX call, not build it as an
  incidental side effect of this data-layer story. New entry in `ROADMAP.md`.
- **v1.52.0 (2026-07-19):** **Task Capability Completion Story 4 ✅ — `ReminderSourceType('task')`.**
  Domain Exposure Verification confirmed the `Reminder` engine is fully generic already; the only real
  gap was the closed type union and the wiring. Task now schedules/reschedules/cancels reminders
  automatically via 4 new event handlers, mirroring Commitment's pattern exactly. A real bug was found
  and fixed during live verification (`reschedule()` no-ops on a missing reminder — fixed by using
  `schedule()`, which required a small, additive enrichment of `TaskDueDateChangedEvent`'s payload
  with `identityId`). Verified end to end against the real backend, 5 scenarios via curl + log
  cross-check. Deliberately did not build the opt-in reminder-toggle endpoint the mobile UI shows —
  flagged as needing its own product decision, not built unilaterally. Also verified, separately, that
  a "planned execution time" (`scheduledAt`) concept does **not** already exist anywhere in the domain
  — confirmed genuinely new surface, same category as `energyLevel`/`location`, not implemented.
- **v1.51.0 (2026-07-19):** **Task Capability Completion Story 3 formally closed.** Backend verified
  end to end for real (not demo mode); the one real bug found (`dueDate ?? undefined`) is fixed and
  covered by tests. The remaining web date-picker gap is deliberately _not_ being fixed inside this
  story — it's a Design System / cross-platform forms issue (also affects Habit and Commitment), not
  a `ScheduleTaskCommand` defect. Split into a new **Cross-platform Date Picker Parity (Web / iOS /
  Android)** epic in `ROADMAP.md` (Status: Future), mirroring how Story 2's bigger calendar idea was
  split into Calendar 2.0 rather than folded in. Proceeding next to Story 4 (`ReminderSourceType`
  Task), gated behind a Domain Exposure Verification check on the Reminder Engine first.
- **v1.50.0 (2026-07-19):** **Task Capability Completion Story 3 ✅.** Added `ScheduleTaskCommand`,
  exposing the existing `Task.schedule()` via `PATCH /v1/tasks/:id/schedule` — confirmed exhaustively
  that no equivalent command already existed before building it, per the Working Principle. Verified
  against the real backend (not just demo mode): a curl create → schedule → get round-trip confirms
  the due date actually changes and the event applies through the real command bus (`version` 1→3).
  `TaskForm`'s due-date field is now editable in edit mode, not just create. Live Playwright
  verification surfaced a **pre-existing, unrelated** bug — registered as `TECH_DEBT.md` Item 43 —
  where `ControlledDatePicker`/`PlainDateTimePicker` open no picker at all on Expo web (confirmed to
  predate this session and affect Habit/Commitment forms equally); closed the resulting verification
  gap with two new `demoTasksRepository.schedule()` unit tests instead, one of which guards a real
  `dueDate ?? undefined` bug caught and fixed in code review before it ever shipped.
- **v1.49.0 (2026-07-19):** **Task Capability Completion Story 1 ✅ and Story 2 ✅.** Story 1:
  exposed `estimatedMinutes` in `TaskForm` via a new reusable `DurationInput` (Design System),
  shown on `TaskCard`/`TaskDetailScreen`; found and fixed a real pre-existing bug (`TaskForm.tsx`'s
  save path never invalidated the query cache after an edit). Story 2: verified live and found
  already satisfied by pre-existing, already-committed code (`calendar.tsx`, commit `a0e865d`) —
  corrects this board's own Story 2 description, which incorrectly claimed nothing rendered
  `estimatedMinutes` in Calendar. The Domain Exposure Verification principle caught this before any
  code was written for Story 2 — exactly the kind of duplicate-work prevention it was registered
  for. The bigger "proportional visual time-block" calendar idea from the epic's founding
  conversation is explicitly out of this epic's scope; added as **Calendar 2.0 / Time Blocking**
  (Status: Future) in `ROADMAP.md` instead of being built here.
- **v1.48.0 (2026-07-19):** Registered the **Working Principle: Domain Exposure Verification**
  (verify a capability isn't already modeled on the aggregate, just unexposed, before adding a new
  domain attribute — reinforces the existing Product Polish domain freeze). Opened **Epic "Task
  Capability Completion"** with 6 stories, all verified against `Task.ts` to require zero
  `packages/domain` changes — direct output of the Task Domain Review closing the Stabilization
  Sprint (see `PROJECT_STATUS.md` v1.69.0, `docs/03-architecture/task_domain_review.md`).
- **v1.47.0 (2026-07-17):** **ADR-021 approved — Goal Backend / CQRS / Event Store decided.**
  Goal's backend to be built on the same pattern Commitment/Task/Habit already prove in production
  (versioned state, not Event Sourcing), plus a previously-built-but-unused `EventStore` connected
  as a durable history log generalizing ADR-014's Commitment-only mechanism. Full detail:
  `TECH_DEBT.md` v1.48.0, `PROJECT_STATUS.md` v1.51.0.
- **v1.46.0 (2026-07-17):** **VS-037's audit phase closed.** 6 findings across 4 categories, 1
  already fixed (B-001), 3 queued into a "Consistency Cleanup" batch (T-001, V-001, V-002), 2
  closed with no action, 1 left open as a genuine product question. Full results table:
  `PROJECT_STATUS.md` v1.49.0.
- **v1.45.0 (2026-07-17):** **VS-037 — Product Consistency Initiative opened.** Return to the
  higher-level roadmap after closing ADR-019/ADR-020, auditing the product against that new
  baseline before structural backend work begins. Numbering corrected twice before registering
  (VS-032 and VS-035 both already taken) — verified against a full sweep of every `VS-0XX`
  reference in the repo, next free number is VS-037. Full detail: `PROJECT_STATUS.md` v1.47.0.
- **v1.44.0 (2026-07-17):** **ADR-020 approved and implemented — Fase 2B (Quick Capture for
  Commitments) shipped and verified live.** Universal Capture philosophy adopted (every
  first-level domain entity eligible by default). `Commitment` added to Quick Capture; the renamed
  "Compromisos" tab's stale default-type mapping fixed (`TECH_DEBT.md` Item 34, Resolved) — with a
  real source-string collision against the standalone Tasks screen caught and avoided before
  shipping. Recovered from a mid-session iCloud sync corruption incident (8 files); found and
  logged 2 unrelated pre-existing backend spec failures as new Item 35. Full detail: `TECH_DEBT.md`
  v1.45.0.
- **v1.43.0 (2026-07-17):** Fase 2B (Quick Capture for Commitments) opened as its own product
  workstream, per ADR-019's "close phase → next phase" discipline. Paso 1 investigation found Quick
  Capture's design was never formalized (organic evolution, confirmed via RI-8's history) and
  surfaced a real, present-day bug — the renamed "Compromisos" tab still opens Quick Capture
  defaulted to "Tarea" — registered as `TECH_DEBT.md` Item 34, explicitly Blocked by Fase 2B, not
  fixed. Full detail: `TECH_DEBT.md` v1.44.0.
- **v1.42.0 (2026-07-17):** **Golden Path #1 PASS — Fase 2A Completed, Item 32 Resolved.** First
  run found and fixed a real bug (`commitment.description` never persisted end-to-end); rerun
  clean. A separate, pre-existing, systemic bug (`historyApi.getHistory` missing demo-mode branch,
  affects all Commitments not just new ones) was found and deliberately left unfixed as out of
  scope — new Item 33. Fase 2B (Quick Capture) may now open as its own independent discussion.
  `docs/07-quality/golden_path_coverage.md` updated to ✅. Full detail: `TECH_DEBT.md` v1.43.0.
- **v1.41.0 (2026-07-17):** Closing entry for the ADR-019 arc — new standing governance indicator
  added, `docs/07-quality/golden_path_coverage.md`, tracking Golden Path status (☐/⏳/✅) and
  execution mode (Manual/Automated/CI) across the product's core flows. No open architecture or
  implementation decisions remain; next work is purely operational (run the Golden Path). Full
  detail: `TECH_DEBT.md` v1.42.0.
- **v1.40.0 (2026-07-17):** Fase 2A stays open on purpose — formalized as `Implemented / Pending
End-to-End Verification` with an explicit gate blocking Fase 2B until the walkthrough runs clean.
  Script promoted to `docs/07-quality/golden_path_commitment_creation.md`, a candidate permanent
  regression test. Full detail: `TECH_DEBT.md` v1.41.0.
- **v1.39.0 (2026-07-17):** User's insistence on real E2E verification (not just typecheck/jest)
  before closing Fase 2A caught two real bugs in `EditCommitmentScreen.tsx` (goalId not prefilled,
  Goal changes silently dropped on save) — fixed with a dedicated `relinkGoal` mutation mirroring
  Habits' already-solved pattern. Item 32 walked back from "resolved" to "implemented, pending
  E2E" — no browser tooling available this session to actually run the walkthrough. Full detail:
  `TECH_DEBT.md` v1.40.0.
- **v1.38.0 (2026-07-17):** **TECH_DEBT Item 32 resolved — Fase 2A implemented.** Commitment
  creation now connects to Goal Workspace's "+" button, mirroring Habits' existing pattern exactly
  (`?goalId=`, editable Goal picker, `NO_GOAL_VALUE` sentinel). Fixed a real demo-data staleness
  bug found along the way (`demoCommitmentDTOs` needed the same `let` + setter-function fix already
  used for Tasks/Habits). Quick Capture support (Fase 2B) stays a separate, explicitly open
  decision. Full detail: `TECH_DEBT.md` v1.39.0.
- **v1.37.0 (2026-07-17):** Fase 2 implementation paused, per user direction, to evaluate the
  creation-flow design first — separated "how does a user create a Commitment" (evaluated,
  recommended) from "should Quick Capture create Commitments" (deliberately left open). Written up
  in `docs/03-architecture/fase2_creation_flow_evaluation.md`. No code changed. Full detail:
  `TECH_DEBT.md` v1.38.0.
- **v1.36.0 (2026-07-17):** ADR-019 Fase 1 (Lenguaje) executed. Goals screen's Commitment-showing
  tab renamed "Tareas"→"Compromisos" (both locales, empty state, stale comment). Goal Workspace's
  mixed tab (Commitments+Habits+Tasks under one "Tareas" label) explicitly deferred to Fase 3 — an
  information-architecture call, not a naming one. Full detail: `TECH_DEBT.md` v1.37.0.
- **v1.35.0 (2026-07-17):** **ADR-019 approved.** `Commitment` stays user-visible; official
  UI-language table (`Objetivo`/`Compromiso`/`Tarea`/`Hábito`) is now normative. Implementation
  plan registered in the ADR: Fase 1 (Lenguaje) → Fase 2 (Creación, connects
  `commitments/create.tsx`) → Fase 3 (Unificación visual, shared cards) → Fase 4 (Product Polish).
  `TECH_DEBT.md` Items 31/32 now "Ready for Phase 1/2." Open question NOT resolved by this
  approval: whether Quick Capture should support creating a Commitment — separate evaluation
  needed. Full detail: `TECH_DEBT.md` v1.36.0.
- **v1.34.0 (2026-07-17):** Wrote `docs/03-architecture/adr_019_commitment_user_model.md` —
  formal ADR answering whether `Commitment` should remain user-visible and, if so, its official
  UI-language table (`Objetivo`/`Compromiso`/`Tarea`/`Hábito` recommended). Status: Propuesta,
  pending explicit approval — no code touched. `TECH_DEBT.md` Items 31 and 32 reclassified in
  framing from ordinary tech debt to "Blocked by ADR." Full detail: `TECH_DEBT.md` v1.35.0.
- **v1.33.0 (2026-07-17):** Ran the exact walkthrough the previous entry's investigation
  prescribed — create a Goal, read the re-seeded Commitments under "Tareas," try to create a new
  one. Confirmed the naming confusion is real even with honest demo data (as predicted). Trying to
  complete "create a new Commitment" surfaced something more severe: **`Commitment` cannot be
  created from anywhere in the app UI** — Quick Capture excludes it by design, Goal Workspace's own
  Commitments section has no add button (unlike its Habits/Tasks siblings), and a fully-built
  `commitments/create.tsx` screen ("Crear Compromiso") exists but is completely unlinked from any
  navigation. That orphaned screen already uses "Compromiso" as its terminology — real evidence a
  version of the naming decision was already underway once, likely during VS-031's move of
  Commitment into Goal Workspace, and never finished. Logged as `TECH_DEBT.md` Item 32 (High
  priority, deliberately not fixed — wiring it up now using its current copy would decide Item 31's
  naming question by default rather than by explicit choice). Full detail: `TECH_DEBT.md` v1.34.0.
- **v1.32.0 (2026-07-17):** A screenshot comparison of two "Tareas" card layouts (Goals'
  Commitment-tab vs. the standalone Tasks screen) led to a deeper investigation than component
  duplication: `GoalTasksTab.tsx` actually renders `Commitment`, not `Task` — three UI surfaces
  (Goals, Goal Workspace, the standalone Tasks screen) all use the label "Tareas" for two different
  domain objects. Read both aggregates (`Commitment`: recurrence/pause-resume; `Task`:
  estimated/actual minutes, simple lifecycle) and `Goal.ts`'s own doc comment (`Goal -> Commitment
-> Task/Habit`) — the domain model is well-designed and was never the problem. The actual root
  cause: `demo-data.ts`'s Commitment titles read at Goal scale ("Run a half marathon"), and Task
  titles were never bespoke (shared per-category filler suffixed with the Commitment's own title).
  Per explicit user sequencing — fix the data honesty first, decide the language question next,
  extract shared components only after that — rewrote all 17 Commitment titles and replaced the
  shared-filler Task-title mechanism with bespoke per-Commitment titles; every numeric field
  untouched, verified unaffected across 5 screens via Playwright. The naming decision itself
  (should "Tareas" ever mean Commitment?) and the 4-way visual card duplication remain open,
  logged as `TECH_DEBT.md` Item 31 — explicitly not resolved this pass. Full detail: `TECH_DEBT.md`
  v1.33.0 (RI-13, Item 31), `docs/03-architecture/DEMO_DATASET.md`.
- **v1.31.0 (2026-07-16):** `TECH_DEBT.md` Item 30 closed same day it was opened, per explicit user
  direction to run one short, targeted investigation before resuming screen audits — a single
  concrete diagnostic question ("disabled by config, or never implemented for this renderer?"),
  not a broad re-audit. Answer was neither: **two chained root causes**, both real, both fixed.
  (1) The installed Tamagui version (2.4.2) activates its entire animation runtime on a prop
  literally named `transition`, not `animation` — confirmed via `@tamagui/web`'s own source
  (`hasAnimationProp` checks `'transition' in props`) and an isolated, unlinked diagnostic route
  (built and deleted same session). (2) Even after the rename, Commitment's own custom presets
  still didn't resolve — `createAnimations()`'s returned `useAnimations` hook is a closure bound to
  whatever preset map was passed in at creation time; extending the _returned_ driver object's
  `.animations` property afterward (the original approach) never reaches that closure. Fixed by
  building one complete driver (stock + custom presets merged) via a single `createAnimations()`
  call in `packages/design-system/src/tokens/motion.ts`/`motion.native.ts`, added
  `@tamagui/animations-css`/`@tamagui/animations-react-native` as direct dependencies to do so.
  **Motion is now fully working, verified end-to-end**: a real press on the Goals screen's actual
  "+" FAB shows genuine mid-transition interpolation (30ms into a 120ms transition, scale/opacity
  partway between start and end values, not snapped), Switch's row wrapper confirmed at the same
  duration. 225/225 design-system tests passing (24 more snapshots updated this round, every diff
  reviewed and confirmed to be the fix genuinely activating — `collapsable={false}` appearing,
  colors resolving through RN's animated-style pipeline — never an unexplained change). Full RCA:
  `TECH_DEBT.md` v1.32.0 (RI-12), `PRODUCT_POLISH_GUIDE.md` v1.5.0.
- **v1.30.0 (2026-07-16):** First Product Polish infrastructure work: user directed centralizing
  Motion in the Theme Engine before resuming screen audits (one future change should reach the
  whole app, not get re-litigated per screen). `ThemeMotion` (`packages/theme-engine`, all 4
  themes) filled in with real values from `COMMITMENT_EXPERIENCE_GUIDE.md` §5
  (buttonPress/cardEntrance/pageTransition/modalTransition/listAnimation); types tightened from
  `any` to real number/spring-config shapes. `packages/design-system`'s Tamagui config extended
  with matching named presets (`tokens/motion.ts` web, `motion.native.ts` native). Found and fixed
  a real, separate dead-code bug while wiring this: `useInteractionAnimation` (shared press-
  feedback hook for Button/Card/Switch/IconButton/Surface) has computed an `animation` value since
  it was written that no consumer ever actually applied to its JSX — fixed in all 5, 11 design-
  system snapshots updated (each diff confirmed to be exactly the new prop before updating).
  `AppearanceProvider`'s theme-crossfade, previously a hardcoded 200ms, now reads the real
  `pageTransition` value — verified via real opacity-decay sampling over time, not just a code
  read. **Required a full Metro/Expo dev-server restart** to regenerate `@tamagui/babel-plugin`'s
  stale config cache (`apps/mobile/.tamagui/tamagui.config.json`, ~13MB, dated a day before this
  session's changes) — a one-time-per-process-boot cache, not something that updates on file
  save/HMR. **Discovered, not resolved:** even with every piece correctly wired, Tamagui's
  `animation` prop produces zero visible CSS transitions anywhere in this app's current web build
  — confirmed systemic (swept the whole DOM on a real screen, found no Tamagui-driven transitions
  at all, not just for the new preset). This predates today's work (the old `'fast'` value never
  resolved to anything either, for a different reason) and needs its own dedicated root-cause pass
  — logged as `TECH_DEBT.md` Item 30 (Medium-High) rather than forced to closure. Full detail:
  `TECH_DEBT.md` v1.31.0 (RI-11, Item 30), `PRODUCT_POLISH_GUIDE.md` v1.4.0.
- **v1.29.0 (2026-07-16):** User's response to the Five Pillars' formalization: approved the
  Bugs → Memorable Moments → Pillars ordering (prevents polishing animations/colors/
  microinteractions while a primary action is still broken), then directed the actual next
  step — write Commitment's own Human Interface Guide before auditing any more screens.
  `COMMITMENT_EXPERIENCE_GUIDE.md` (new, v1.0.0) gives every Pillar concrete rules instead of just
  an Objetivo: real spacing/padding numbers and card-vs-list-vs-hero rules (Ritmo Visual), a
  3-question hierarchy test + 3-visual-weight rule (Jerarquía), element/action/typography density
  caps (Densidad), voice principles with concrete bad/good copy examples (Microcopy), real
  millisecond values mapped onto `ResolvedTheme.motion`'s existing (currently `null`) fields
  (Motion), per-color emotional meaning independent of theme — directly resolves the first audit's
  red-deltas finding with an actual rule instead of an open observation (Color), and a haptic/
  sound taxonomy tied to the existing `reducedMotion` setting (Sonido e Haptics). Every Five
  Pillars `Status:` line in `PRODUCT_POLISH_GUIDE.md` v1.3.0 updated to point at its concrete
  section. **No further screen audits until this document existed — it now does**, so the next
  audit under this milestone is the first with a stable, comparable standard.
- **v1.28.0 (2026-07-16):** User's response to the first audit's results: approved the Bugs/
  design-decisions separation (RI-8/9/10 fixed immediately, the two friction observations logged
  not fixed) as the correct discipline, then directed the actual next step — formally define the
  Five Pillars **before** auditing any more screens, as a document with measurable objectives, not
  a bare list. `PRODUCT_POLISH_GUIDE.md` v1.2.0: each pillar now has an **Objetivo** (the pass/fail
  bar) and concrete rule categories (Motion: max transition duration, allowed curves, spring vs.
  timing, when to haptic, when to animate; Visual Language: hierarchy legible in <3s via spacing/
  density/materials/contrast/elevation/alignment; Interaction: one dominant CTA per screen, max 2
  visible secondary actions, consistent gestures; Content: never feel technical/administrative,
  covers copy/empty/error/success/Coach voice/tone; Delight: constant perceived progress/reward
  without distraction). Also added a second audit dimension per user direction: every finding is
  now either a **Bug** (fixed immediately) or a **Memorable Moment** opportunity (logged, triaged
  against the Pillars) — never mixed into one pile. Every audit from here on closes with a
  **Product Polish Score** (grade per pillar + Overall Premium Score) and a **Memorable Moments**
  list (✓ existing / Opportunities), replacing "any defects left?" with "does this leave an
  impression matching the quality bar?" as the closing question.
- **v1.27.0 (2026-07-16):** Product Polish's first audit performed — the golden-path walkthrough
  methodology `PRODUCT_POLISH_GUIDE.md` v1.0.0 specified, run for real (Playwright, real clicks,
  not a code read). Found the app's single most-used action — Quick Capture's "+" button — broken
  in three independent, compounding, user-invisible ways: always defaulted to the wrong capture
  type when opened from Goals (and the Goals FAB wasn't tab-aware at all — Tareas/Roadmaps
  sub-tabs inherited the same wrong source), Goal/Habit captures never invalidated the query that
  displays them, and the dedicated Create-Habit form's demo repository mutated its list in place
  (same bug class as Tasks' RI-2, one method that fix never reached). All three fixed and verified
  same-session — `TECH_DEBT.md` v1.30.0 RI-8/RI-9/RI-10. Logged, not fixed: a truncated tab label
  and a wall of red negative deltas in Insights (Content/Visual-Language pillar work, still
  undefined), a rough perceived-performance timing baseline, and one dev-tool-only React 19
  warning (Item 29, not a Polish finding). Full detail and the audit's own reflection on why this
  methodology caught what code review wouldn't: `PRODUCT_POLISH_GUIDE.md` v1.1.0.
- **v1.26.0 (2026-07-16):** Product Polish kickoff direction from the user: before touching any
  screen, define the milestone's own standards first. Created `PRODUCT_POLISH_GUIDE.md` (v1.0.0) —
  an experience document, not a technical one — with the Five Pillars (Motion/Visual Language/
  Interaction Language/Content/Delight, all currently undefined, that's this milestone's first
  work) and a working `Principios` list given directly by the user. Also recorded the milestone's
  audit methodology: the first pass is a full 10-15min usage walkthrough (create a Goal, create a
  Habit, complete Habits, create Tasks, switch themes, review Insights, use Today) logged for
  friction ("esto tarda demasiado," "aquí dudé," "no parece premium"), reviewed with fresh eyes —
  explicitly not a code read or a functional-assertion Playwright pass (that's VS-032's
  methodology, stays there).
- **v1.25.0 (2026-07-16):** VS-032 closing evaluation delivered by the user (Principal Architect
  role) — recorded verbatim above ("VS-032 — Final Evaluation"): Arquitectura A, Calidad del
  proceso A+, UX A-, full Product Readiness table. Redefined the next milestone per that
  evaluation: **not** `VS-033` (that number stays reserved for Reminder Settings) — a distinctly
  named **"Milestone: Product Polish"** with three explicit freezes (domain, Design System,
  navigation — bugs only in all three until this milestone is scoped) and a different measurement
  axis entirely: not bugs-closed/components-migrated (VS-032's metrics, now retired), but
  time-to-complete-frequent-tasks, visual consistency, premium perception, microinteractions,
  animation quality, copy, onboarding, delight, fine-grained accessibility, perceived performance.
  Guiding question going forward: not "¿qué pantalla sigue?" but "¿qué haría que Commitment
  pareciera una aplicación de Apple, Notion o Linear?"
- **v1.24.0 (2026-07-16):** Appearance closed — the last VS-032 Design System Adoption screen.
  Scoped deliberately small per explicit user direction (no new capabilities): verified the 4
  themes select/persist/preview correctly, are independent of Demo Mode (a device-level setting,
  correctly not routed through the demo/real API seam), and that Reduced Motion genuinely skips the
  crossfade transition (not just shortens it). Found and fixed a real accessibility bug: the theme
  picker (`ThemePreviewCard.tsx`) set `accessibilityState={{selected}}` as a raw React Native prop
  instead of going through `toPlatformAccessibilityProps` (the helper every other interactive
  element in the app uses) — react-native-web never translates that to `aria-selected` on its own,
  confirmed via DOM inspection (attribute absent for all 4 cards, before and after selection).
  Fixed and reverified. Found, logged, explicitly not fixed: "Alto contraste" persists and toggles
  its own switch but has zero downstream effect anywhere — `ThemeResolver.resolve()` receives the
  flag and never acts on it (`TECH_DEBT.md` Item 28); not a WCAG AA violation (all 4 themes
  independently reverified to pass AA on their real content-color pairs without it) so per the
  standing stop-condition rule this was logged and the checkpoint continued rather than pausing.
  **VS-032 formally declared `Closed`.** UI Freeze now covers all 9 adopted screens as a single
  block, lifting only when Product Polish actually starts. **Product Polish Sprint opened as the
  active milestone** — see Priorities below and `PROJECT_STATUS.md` v1.30.0. Full detail:
  `TECH_DEBT.md` v1.29.0 (RI-7, Item 28).
- **v1.23.0 (2026-07-16):** Profile closed (VS-032). Functional audit — same 5-point standard as
  Tasks/Insights — found the identity/plan card always showed the hardcoded demo user regardless of
  the Demo Mode toggle, the only screen not routing through the demo/real API-layer seam. Fixed with
  `profile.api.ts`/`useProfile()`; also migrated raw Tamagui `Text`/`Button`/`Switch` to
  `@commitment/design-system`. New `TECH_DEBT.md` Item 27 (no real Identity/Profile backend, parallel
  to Goal's TD-10/A1) — the mobile side is now structured to take a real branch without further UI
  changes once that backend exists. **Profile added to the UI Freeze** (now 8 screens). Appearance is
  the last VS-032 Design System Adoption item before Product Polish.
- **v1.22.0 (2026-07-16):** Insights' 2 UX findings resolved per user decision: Finding 1 (only 1 of
  4 stat cards interactive, no affordance cue) explicitly deferred to Product Polish (`TECH_DEBT.md`
  Item 26, 3 valid options logged, none implemented). Finding 2 ("Hábitos de Hoy" duplicating Today's
  own widget) fixed same-day — replaced with real, honestly-computable consistency metrics (average
  streak + habits-with-active-streak across ALL enabled habits), explicitly rejecting fabricated
  per-day history the domain model doesn't track (`TECH_DEBT.md` RI-5). Declared a **UI Freeze** on
  the 7 audited screens (Today/Coach/Calendar/Goals/Habits/Tasks/Insights) — further changes there
  restricted to bugs/accessibility/performance/explicit Product Polish decisions, so Profile/
  Appearance work doesn't introduce style drift that has to be re-propagated later.
- **v1.20.0 (2026-07-16):** Refined the mandatory-functional-audit rule (v1.19.0) into an explicit
  5-point checklist per user direction: integridad arquitectónica, experiencia funcional completa,
  CTA principal alcanzable, actualización inmediata sin refrescos manuales, sin regresiones de
  accesibilidad. The Tasks audit is now the reference template for every remaining VS-032 capability,
  not just the incident that prompted the rule. Also logged (in `TECH_DEBT.md` Item 20) a deferred
  architectural note: if a second/third `<Portal>` consumer needing a manual `<Theme>` rewrap shows
  up, extract a shared `ThemedPortal` instead of repeating the pattern — not built now, one consumer
  doesn't justify it.
- **v1.21.0 (2026-07-16):** Insights closed applying the Tasks checklist from the start (no false
  start this time) — the 5-point audit plus explicit product-audit dimensions the user requested
  (functional/UX/domain/Design System/accessibility). Found and root-cause-fixed a bug bigger than
  Insights itself: `AppScreen` had no background of its own, so any screen shorter than the viewport
  showed a light gap under its content on any non-default theme — fixed once in the shared primitive
  (`packages/design-system/src/screens/AppScreen.tsx`), covering all 12 consumers, not patched
  per-screen. Also deleted a duplicate feature-local `StatCard` in favor of the design-system one
  (built for this exact screen, never wired up), closed more of Item 13's `LoadingState`/`ErrorState`/
  `EmptyState` migration, and added missing `accessibilityLabel`s to two components. Logged two new
  findings without fixing them unilaterally: Item 24 (native navigation headers ignore the active
  Experience Theme — systemic, confirmed on Goal Workspace too, not Insights-specific) and 2 UX
  observations left for a product decision (ambiguous stat-card interactivity, Today/Insights habit
  data duplication). Full detail: `TECH_DEBT.md` v1.26.0.
- **v1.19.0 (2026-07-16):** Correction to v1.18.0's "Tasks ✅" — that checkpoint had verified domain/
  CQRS/persistence but never a real functional audit of the primary user flow, and the user
  (correctly) refused to accept it as closed. Functional audit (real clicks, not code reading) found
  two blockers: the "New task" FAB was visually present but unclickable on web (a CSS stacking-context
  bug — `document.elementFromPoint()` at its center resolved to the tab bar underneath it, not the
  FAB), and the demo Tasks repository mutated its array in place, so React Query's `refetch()` never
  visibly updated the UI without an unrelated re-render forcing it. Both root-caused and fixed (see
  `TECH_DEBT.md`'s "Resolved Issues — Lessons Learned"), audit re-run and passed. Added a permanent
  rule: no capability may report `Ready for Production: Sí` on typecheck + unit tests + Playwright
  assertions alone — a functional audit of the primary flow (real clicks, immediate-update checks,
  entry-point reachability) is now mandatory first. Tasks is now genuinely closed; **Insights** next.
- **v1.18.0 (2026-07-15):** VS-032 Fase 2 (Tasks) closed. Design doc corrected its own premise
  (verified in code: no parallel "Priority Task" entity, Hero already reused `TasksScreen`/
  `TaskForm`) then got expanded by 7 user corrections before implementation: Goal/Commitment mutual
  exclusivity as a domain invariant (not two independent selectors), score-based Priority-of-the-day
  instead of a fixed origin hierarchy, a consistent Hero Card structure regardless of task origin, one
  unified "Relacionado con" selector in `TaskForm` (closing a found-live edit-mode gap — the old
  Commitment picker only rendered on create), and a demo-verified case of a non-Commitment task
  actually winning the Hero. Full evidence: `TECH_DEBT.md` v1.23.0 Item 22 (Item 23 opened as a
  separate, pre-existing Medium finding).
- **v1.17.0 (2026-07-15):** Habits Item 18 fully closed — Goal linkage is now genuinely optional
  end-to-end (domain method + event, backend CQRS, mobile picker, demo dataset). Product decision:
  Goal is opt-in for Habits, not assumed. Same principle now scoped for Tasks — Phase 2 is a short
  design document proposing Task/Goal optionality _and_ consolidating Today's "Priority Task" into
  a single Task concept (Recommendation Engine returns a reference, not a parallel entity), for
  user approval before any Task implementation begins. Full evidence: `TECH_DEBT.md` v1.22.0.
- **v1.16.0 (2026-07-15):** P1/Critical: global scroll regression, root-caused and fixed —
  `PostponeSheet`'s new `BottomSheet` was the app's first use of `@gorhom/bottom-sheet`, which
  requires `GestureHandlerRootView` at the root; confirmed missing app-wide, added to
  `app/_layout.tsx`. Verified across all 9 screens (Today/Coach/Calendar/Goals/Habits/Tasks/
  Insights/Profile/Appearance) on web; native device verification not possible in this environment
  (no simulator access), flagged not hidden. Full RCA: `TECH_DEBT.md` Item 21, v1.21.0.
- **v1.15.0 (2026-07-15):** Postpone redesigned around a new Design System primitive,
  `DurationWheelPicker` (iOS Timer-style wheel picker) — explicit user override of the "no new DS
  components" rule for this piece, built as a genuinely reusable primitive (Tasks/snooze/countdowns/
  focus timers named as future consumers). `PostponeSheet` rewritten around it; domain logic
  (`usePostponeHabit`) unchanged. Found and fixed a real clipping bug in the picker's first draft, and
  registered a pre-existing High-severity finding (Item 20): every `Portal`-rendered modal in the app
  ignores the active theme on web — not caused by this change, caught only because this is the first
  time a modal was verified in a non-default theme. Full evidence: `TECH_DEBT.md` v1.20.0.
- **v1.12.0 (2026-07-15):** Habits marked ✅ — first capability-level pass (Feature Completeness +
  Cross-feature consistency, not just the primary screen). 3 real bugs found and fixed (0% DS
  adoption on the Habits "view all" screen, a wrong i18n key in an error state, a missing
  `$background` that broke the Midnight theme). One real gap documented, not built: Habit↔Goal
  linkage has no UI path (Item 18, High) — needs a product/UX decision on where the picker lives
  before implementing. Tasks is next. Full evidence: `TECH_DEBT.md` v1.16.0.
- **v1.14.0 (2026-07-15):** Habits UX redesign, iteration 2 — user reviewed iteration 1 and asked
  for a radical simplification instead (Apple Reminders-style list: circle/name/recurrence/streak/
  chevron only, nothing else). Postpone/Archive/Goal-context moved into the habit detail
  (`EditHabitScreen.tsx`) reusing existing mutations only, no new functionality added. `HabitsHero`
  moved toward an Activity Rings layout. Found and fixed a real regression the iteration's own first
  draft introduced (nested `<button>`-in-`<button>` from a clickable circle inside a clickable Card
  — same defect class as TD-015's own follow-up regression). Full evidence: `TECH_DEBT.md` v1.19.0.
- **v1.13.0 (2026-07-15):** Habits UX redesign (Apple Health/Fitness/Timers-inspired visual/motion
  pass, requested before moving to Tasks) — `HabitsHero` + `HabitCard` built and consolidated across
  all 3 places a habit row was rendered. Item 18's UX decision made (hybrid: always-available picker
  in `HabitForm` + a `GoalWorkspaceScreen` "Add Habit" entry point) — implementation still deferred.
  2 more real bugs found live and fixed (a P2 title-duplication instance, a flexbox overlap bug).
  Full evidence: `TECH_DEBT.md` v1.18.0.
- **v1.11.0 (2026-07-15):** Refined the checkpoint format per user feedback on the Goals checkpoint:
  Design System adoption is now a component-by-component checklist (not a bare percentage),
  findings are counted separately from fixes (Findings/Fixed/Deferred/Regressions), and Production
  Readiness gained a `Confidence` line. Added capability-level scope effective Habits onward — a
  checkpoint now audits the whole lifecycle (create/edit/complete/reminder/recurrence) and
  integration surface (Calendar/Coach/Goals/Insights/Demo Mode), not just the primary screen's UI —
  with two new scorecards, "Feature Completeness" and "Cross-feature consistency".
- **v1.10.0 (2026-07-15):** Goals marked ✅ in the VS-032 Design System Adoption block — Habits is
  next. Full checkpoint (adoption details, UX review, Production Readiness scorecard) reported to
  the user in-session; governance evidence lives in `TECH_DEBT.md` v1.15.0 and
  `architecture_product_audit_2026Q3.md` v1.2.0 (P5 fixed).
- **v1.9.0 (2026-07-15):** Added "Adoption scope per screen" (each screen's pass is a full product
  experience review — visual hierarchy, navigation, CTA, empty/populated states, Demo Mode, spacing,
  typography, truncation, responsive, themes, accessibility, keyboard nav, cross-screen consistency
  — not a component-swap-for-adoption-percentage exercise) and a "Production Readiness scorecard"
  checkpoint requirement, both effective starting with the Goals screen, per explicit user direction.
- **v1.8.0 (2026-07-15):** Added a "Working Agreement for Design System Adoption" section per
  explicit user direction: platform stabilization is treated as done going forward and is not
  re-audited per screen; only functional regressions, data loss, cross-feature architectural
  violations, WCAG AA failures, or Critical debt stop the adoption work — High/Medium findings get
  logged in `TECH_DEBT.md` and work continues. Restructured the VS-032 Priorities entry into the
  three blocks (Foundation / Design System Adoption / Product Polish) the user specified.
- **v1.7.0 (2026-07-15):** Closed the TD-015 keyboard-accessibility mini-phase (verified fixed) and
  resumed Design System Adoption at Goals per explicit user direction, superseding v1.6.0's "VS-032
  planning is blocked" gate. Verified against code that the audit's Critical (P1/TD-8) and one High
  (P3/TD-9) finding are also already fixed, undocumented until now; 4 High findings remain open,
  tracked not blocking. Full evidence: `architecture_product_audit_2026Q3.md` v1.1.0, `TECH_DEBT.md`
  v1.14.0. Added a VS-032 line to Priorities reflecting the informal label already in use in
  `TECH_DEBT.md`'s change history since v1.4.0.
- **v1.6.0 (2026-07-15):** Added a "Current Phase: Stabilization & Product Audit" section — VS-032
  planning explicitly blocked until the audit's findings are resolved or triaged. Corrected VS-031's
  stale "uncommitted" reference. Registered the audit's own headline findings (see
  `architecture_product_audit_2026Q3.md`).
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
