# Engineering Board

Version: 1.47.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-17

---

## Current Epic

Epic VS — Vertical Slice Product Phase

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
