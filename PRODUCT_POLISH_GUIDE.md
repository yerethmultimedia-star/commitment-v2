# Commitment v2 — Product Polish Guide

Version: 1.5.0
Status: Active
Owner: Principal Architect (user) + Architecture Review Board
Last Updated: 2026-07-16

---

This is **not** a technical document. `ARCHITECTURE.md`, `TECH_DEBT.md`, and `ENGINEERING_BOARD.md`
already own correctness, structure, and debt. This document owns **how the product feels** —
it exists because VS-032 closed with every architectural/functional dimension at `A` and UX at
`A-` (see `ENGINEERING_BOARD.md` v1.25.0, "VS-032 — Final Evaluation"), and the gap between those
two grades is exactly what this document is for.

Created at the same moment the **Milestone: Product Polish** (not `VS-033`, see
`ENGINEERING_BOARD.md` v1.25.0) was opened. If this document and the milestone's own definition
ever drift, this document is the more detailed source — `ENGINEERING_BOARD.md` should be updated to
match, not the other way around.

**Concrete rules live in a sibling document, not here:** `COMMITMENT_EXPERIENCE_GUIDE.md` is
Commitment's own Human Interface Guide — real numbers, real copy examples, real color meanings.
This document defines _what_ the Five Pillars are and _how_ an audit is run; that one defines
_exactly what a screen must do_ to pass. Per explicit user direction: **no further screen audits
until that document existed** — it now does (v1.0.0), so the next audit is the first with a stable,
comparable standard instead of a fresh judgment call.

---

## Principios

A v1 draft, given directly by the user at this document's creation. These are meant to be checked
against every Product Polish decision, not aspirational copy — if a proposed change violates one of
these, that's a reason to reconsider the change, not the principle.

- Una acción principal por pantalla.
- Nunca más de dos acciones visibles por card.
- Todo cambio importante recibe feedback visual.
- Toda transición tiene continuidad espacial.
- Ninguna pantalla se siente administrativa.
- Las animaciones comunican estado, no decoración.
- El contenido es más importante que el contenedor.

---

## The Five Pillars

Formally defined 2026-07-16, immediately after the first audit (below) validated the need — before
that, this section was a bare list of areas with no way to actually judge a screen against them.
Each pillar now has an **Objetivo** (the standard a screen/interaction must meet — the pass/fail
bar) and concrete rules/metrics it's checked against. This is still v1: rules will sharpen as real
screens get measured against them, but the bar itself shouldn't move casually — a rule that turns
out wrong should be revised deliberately, not quietly ignored on the next screen.

### 1. Motion

**Objetivo:** Toda interacción importante debe confirmar visualmente la acción y mantener
continuidad espacial.

**Reglas / métricas:**

- Duración máxima de transiciones.
- Curvas permitidas (easing).
- Cuándo usar spring vs. timing.
- Cuándo usar haptics.
- Cuándo animar y cuándo no.

_Implementation seam already exists:_ `packages/theme-engine`'s `ResolvedTheme.motion` has
`fast`/`normal`/`slow`/`spring`/`pageTransition`/`modalTransition`/`buttonPress`/`cardEntrance`/
`listAnimation` fields — most are currently `null` per-theme (see `default-light.theme.ts` etc.).
This pillar's job is deciding what those values actually are, not inventing new plumbing.

_Status: fully working, verified end-to-end (2026-07-16) — `ThemeMotion` (all 4 themes) carries
real numbers, `AppearanceProvider`'s crossfade reads `theme.motion.pageTransition`, and
`Button`/`Card`/`Switch`/`IconButton`/`Surface` all produce real, correctly-timed CSS transitions
on press (confirmed via real Playwright presses showing genuine mid-transition interpolation, not
just a code read). Two chained root causes found and fixed along the way — a dead-code bug
(`useInteractionAnimation` computed a value no consumer applied) and a Tamagui version-specific API
gap (the activating prop is `transition`, not `animation`; `createAnimations()` must be called once
with the complete preset map, not extended after the fact). Full RCA: `TECH_DEBT.md` RI-11/RI-12.
Native platforms (iOS/Android) unverified — no simulator access in this environment._

### 2. Visual Language

**Objetivo:** Cada pantalla debe comunicar una jerarquía evidente en menos de tres segundos.

**Incluye:**

- Espaciado.
- Densidad.
- Materiales.
- Contraste.
- Elevación.
- Alineaciones.

_Status: concrete values defined — `COMMITMENT_EXPERIENCE_GUIDE.md` §1 (Ritmo Visual, spacing/
padding/card-vs-list-vs-hero rules), §2 (Jerarquía, the 3-question test + 3-weight rule), §3
(Densidad, the element/action/typography caps), §6 (Color, emotional meaning per color — resolves
the first audit's red-deltas finding with an actual rule instead of leaving it open). Materials/
blur/transparency remain explicitly undecided — §1 covers layout rhythm, not surface treatment._

### 3. Interaction

**Objetivo:** La acción principal siempre debe ser evidente y ejecutarse con el mínimo esfuerzo
posible.

**Reglas:**

- Un CTA dominante por pantalla.
- Máximo dos acciones secundarias visibles.
- Gestos consistentes (swipe, long press).
- Bottom sheets.
- Menús contextuales.
- Estados de presión y selección.

_Existing precedent to build on, not start from zero:_ bottom sheets (`DurationWheelPicker`,
Postpone) — worth auditing for consistency as this pillar's rules get sharper. Haptics are used
inconsistently (`Switch` has them built in, most other controls don't) — needs a real rule, not
per-component improvisation.

_Status: partially concrete — the "un CTA dominante"/"máximo dos acciones" numbers are defined
(`COMMITMENT_EXPERIENCE_GUIDE.md` §3, shared with Densidad) and already validated in spirit by
RI-8's fix (Quick Capture now opens on the type the user's context actually implies), even though
that fix predates this pillar's formal definition. Gesture consistency, bottom-sheet conventions,
and haptic taxonomy are named (§7) but not yet given per-gesture concrete rules — next to define._

### 4. Content

**Objetivo:** La aplicación nunca debe sentirse técnica o administrativa.

**Define principios para:**

- Copy.
- Mensajes vacíos (empty states).
- Mensajes de error.
- Mensajes de éxito.
- Lenguaje del Coach.
- Tono general.

_Concrete backlog already waiting on this pillar's rules:_ `TECH_DEBT.md` Item 27's Profile
empty-state note; the first audit's two findings (Insights' truncated "Trimestre" tab, the
unframed wall of red deltas).

_Status: concrete rules defined — `COMMITMENT_EXPERIENCE_GUIDE.md` §4 (Microcopy: voice principles,
the error/empty-state formula, CTA-naming rule). Directly resolves the Insights-tab-truncation
finding's underlying cause (generic labels aren't this pillar's problem, but the "always specific,
never generic" rule applies to it) and gives Item 27's Profile empty-state note a rule to follow
rather than inventing copy ad hoc when that gets implemented._

### 5. Delight

**Objetivo:** El usuario debe percibir progreso y recompensa constante sin distraerse.

**Incluye:**

- Celebraciones.
- Microanimaciones.
- Feedback inmediato.
- Progresos.
- Pequeñas sorpresas.
- Percepción de velocidad.

_Status: partially concrete — `COMMITMENT_EXPERIENCE_GUIDE.md` §6 names Dorado (gold) as a
milestone-tier achievement color, deliberately unused anywhere yet; §7 names a distinct
Success-pattern haptic for the same trigger conditions. Both are defined as a *target*, not built —
this pillar still has no shipped celebration/progress-micro-animation anywhere in the app. Sound
stays explicitly off by default (§7) rather than an open question._

---

## Methodology: how Product Polish work gets found (not code review)

Every audit under this milestone is **not** a code read and not a Playwright functional-assertion
pass (that methodology belongs to [[feedback_mandatory_functional_audit]] and VS-032 — it verifies
correctness, not feel). Instead:

1. Walk the app for 10-15 minutes doing real tasks end to end: create a Goal, create a Habit,
   complete Habits, create Tasks, switch themes, review Insights, use Today.
2. Review that walkthrough with fresh eyes, without touching code, and log every moment across
   **two separate dimensions** (added 2026-07-16, after the first audit's results made the
   distinction obvious — see below):
   - **Bugs** — something doesn't work. "El nuevo objetivo no aparece," "el toggle no hace nada,"
     "el botón abre el tipo equivocado." Always in scope to fix immediately, under all three
     Product Polish freezes (bugs are the one thing every freeze exempts) — regardless of which
     pillar it happens to touch.
   - **Memorable moments** — something works correctly but doesn't yet make the product feel
     premium. "Esto tarda demasiado," "se siente pesado," "aquí dudé," "movimiento brusco," "no
     parece premium," _or the positive version_ — "esto sí se siente cuidado." Never fixed in the
     same pass it's found; triaged against the Five Pillars above and scheduled as real work once
     a pillar's rules exist to judge it against.
3. Bugs get fixed and verified same-session, same discipline as any other functional bug in this
   codebase (root cause, not a surface patch, regression test where a repository/hook is involved).
   Memorable-moments findings get logged, not fixed ad hoc — mixing the two turns "did we fix real
   defects" and "did we make deliberate design decisions" into one undifferentiated pile, which is
   exactly what this separation exists to prevent.

This is deliberate: friction found this way comes from the whole experience, not from an isolated
component — the same reason VS-032's later checkpoints moved from screen-swaps to full capability/
product audits (see `TECH_DEBT.md` "Resolved Issues — Lessons Learned", RI-1 through RI-7).

### Closing report format (effective 2026-07-16, every audit from here on)

Every Product Polish audit ends with two scorecards, in addition to whatever bug-fix detail goes
into `TECH_DEBT.md`. Both are graded/counted, not narrated — a reader should be able to check each
line against the audit's own evidence.

```text
Product Polish Score

Motion              <grade>
Visual Language     <grade>
Interaction         <grade>
Content             <grade>
Delight             <grade>

Overall Premium Score   <grade>
```

```text
Memorable Moments

✓ Ya existentes
• ...

Opportunities
• ...
• ...
```

The question this format is meant to force at the end of every audit is not "¿ya no hay defectos?"
(that question belongs to the Bugs dimension and to VS-032's own closed methodology) — it's **"¿esta
pantalla deja una impresión comparable con el nivel de calidad que buscamos?"** A screen can score
zero bugs and still score low here; that's not a contradiction, it's exactly the gap this whole
milestone exists to close (see VS-032's own UX: `A-`, not `A`, in `ENGINEERING_BOARD.md` v1.25.0).

Grades against the Five Pillars are only meaningful once each pillar has concrete rules to check
against — until then, "grade" means "does this even have a defined standard yet," not a polish
quality score. Don't backfill a confident-looking grade against a pillar that's still `Status:
objective defined, no concrete rules chosen`.

---

## First Audit — 2026-07-16

Golden path walked via Playwright (real clicks, not `force:true`, screenshots + timing at each
step) rather than a literal recorded video, but same spirit: Today (initial) → create a Goal →
create a Habit → complete a Habit → create a Task → review Insights → back to Today. Full detail:
`TECH_DEBT.md` v1.30.0 (RI-8, RI-9, RI-10, Item 29).

**What this audit found was not friction — it was silent data loss.** The single most-used action
in the entire app (tap "+", type something, submit) was broken in three independent, compounding
ways: Quick Capture always defaulted to the wrong type for Goals, Goal/Habit captures never told
React Query anything changed, and the dedicated Habit-creation form's demo repository mutated its
list in place. All three were user-invisible — no error, no toast, the thing you just typed simply
never appeared. **All three fixed and verified same-session** (RI-8/RI-9/RI-10) — this is squarely
"bugs only," in scope under all three Product Polish freezes, and arguably more urgent than any
pillar-definition work: a premium feel is meaningless if the primary CTA silently eats your input
first.

**Genuine friction/polish observations, logged, not fixed** (deliberately — these belong to pillars
that are still undefined; fixing them ad hoc would be exactly the "start with a screen instead of a
standard" mistake this document exists to avoid):

- **"esto no parece una app premium"** — Insights' period tabs ("Semana" / "Mes (Próximamente)" /
  "Trimestre (Próx...") — the third tab's label is truncated mid-word with no ellipsis, reads as
  broken rather than intentionally-disabled. **Content pillar.**
- **"aquí dudé"** — Insights' weekly summary is a wall of red negative deltas (Tareas completadas
  -7, Productividad -79, Enfoque promedio -15) with no framing — for a product explicitly
  positioned as a _Personal Growth OS_ (see product vision memory), leading every week with
  discouraging red numbers and no context is worth a deliberate content/tone decision, not
  necessarily a data problem. **Content + Visual Language pillars.**
- **Perceived performance baseline** (dev server, not representative of a production bundle, but a
  useful relative baseline): cold load to interactive ≈5.6s; Quick Capture dialog open ≈0.7-1.4s;
  submit-to-visible-result ≈0.9-1.4s; habit-toggle feedback ≈0.7-0.9s. None of these read as
  "tarda demasiado" in isolation, but there's no motion/easing on any of these transitions yet
  (Motion pillar, still undefined) — they're fast but flat, not smooth.
- React 19 `element.ref` deprecation warning surfacing as a visible dev-mode toast during this exact
  flow (`TECH_DEBT.md` Item 29) — logged as tech debt, not a Polish finding (it's a dev-tool
  artifact, not a production feel issue), but noted here since it was found in the same walkthrough.

**What this confirms about the methodology:** the "walk the golden path, not the code" approach
worked exactly as intended — none of RI-8/9/10 would have been caught by `tsc`, unit tests, or a
component-level review; all three only show up when you actually try to use the app the way a real
user would, back to back, without stopping to inspect internals. This result is also what directly
motivated the Bugs/Memorable-Moments split and the Five Pillars' formal objectives above (added
immediately after, same day) — RI-8/9/10 were unambiguously **Bugs**; the truncated tab label and
the unframed red deltas were unambiguously **Memorable-Moments opportunities**. Keeping those two
piles separate from the start is exactly why this audit's closing note could say "fixed 3, logged
2" instead of one undifferentiated list.

---

## 📜 Change History

- **v1.5.0 (2026-07-16):** User's response to the Motion infrastructure checkpoint: agreed with
  the not-forcing-closure decision, then directed a short, targeted investigation into Item 30
  specifically — one concrete question ("¿disabled by config, or never implemented for this
  renderer?"), not a broad re-audit. Answer was neither: a Tamagui version-specific API rename
  (the activating prop is `transition`, not `animation`) compounded by a closure-binding gotcha in
  how `createAnimations()`'s driver gets extended. Both root-caused and fixed same session — Item
  30 closed. **Motion now fully works, verified end-to-end** (real Playwright presses showing
  genuine mid-transition interpolation on the actual Goals FAB, not a probe or a code read). Full
  RCA: `TECH_DEBT.md` v1.32.0 (RI-12).
- **v1.4.0 (2026-07-16):** User's response to the Experience Guide: agreed the next step is
  infrastructure, not more screen audits or implementing every rule at once — starting with the
  Theme Engine, since centralizing Motion means one future change reaches the whole app. Wired
  `ThemeMotion` (theme-engine, all 4 themes) with the real values from §5, and extended
  `packages/design-system`'s Tamagui config with matching named presets. Found and fixed a real
  dead-code bug along the way: `useInteractionAnimation` (the shared press-feedback hook for
  Button/Card/Switch/IconButton/Surface) computed an `animation` value no consumer ever actually
  applied to its JSX — fixed in all 5. `AppearanceProvider`'s theme-crossfade, previously a
  hardcoded 200ms matching nothing, now reads the real `pageTransition` value — verified working
  via real opacity-decay sampling. **Discovered, not resolved:** even fully wired, Tamagui's
  `animation` prop produces no visible CSS transition anywhere in this app's web build — a deeper,
  pre-existing gap unrelated to this session's changes (`'fast'`, the previous value, never worked
  either, for a different reason). Logged as `TECH_DEBT.md` Item 30 (Medium-High) rather than
  forced to a premature fix. Full detail: `TECH_DEBT.md` v1.31.0 (RI-11, Item 30).
- **v1.3.0 (2026-07-16):** User's response to the Five Pillars' formalization: approved the
  Bugs → Memorable Moments → Pillars ordering as correct discipline (prevents starting to change
  animations/colors/microinteractions while a primary action is still broken), then directed the
  actual next step — before auditing any more screens, write the concrete rules those Pillars
  check against. Created `COMMITMENT_EXPERIENCE_GUIDE.md` (v1.0.0, sibling document, root-level) —
  Commitment's own Human Interface Guide: real spacing/padding numbers (Ritmo Visual), a 3-question
  hierarchy test + 3-weight rule (Jerarquía), element/action/typography caps (Densidad), voice
  principles with concrete bad/good copy examples (Microcopy), real millisecond values mapped onto
  `ResolvedTheme.motion`'s existing fields (Motion), emotional color meaning per color rather than
  per theme (Color — directly resolves the first audit's red-deltas finding with an actual rule),
  and a haptic/sound taxonomy tied to the existing `reducedMotion` setting (Sonido e Haptics).
  Every Five Pillars `Status:` line above updated to point at its concrete section instead of
  saying "no concrete rules chosen yet." Full detail: `ENGINEERING_BOARD.md` v1.29.0.
- **v1.2.0 (2026-07-16):** Five Pillars formally defined — each now has an explicit **Objetivo**
  (pass/fail bar) and concrete rule categories, given directly by the user, replacing the earlier
  bare area-lists. Audit methodology gained a second dimension: every finding from here on is
  classified as either a **Bug** (fixed immediately, same discipline as any functional bug) or a
  **Memorable Moment** opportunity (logged, triaged against the Pillars, never fixed ad hoc) —
  retroactively applied to the first audit above (RI-8/9/10 = Bugs; truncated tab + red deltas =
  Memorable-Moments opportunities). Every audit from now on closes with two scorecards: **Product
  Polish Score** (a grade per pillar + an Overall Premium Score) and **Memorable Moments** (✓
  existing / Opportunities) — the question a closing audit answers is no longer "any defects left?"
  but "does this leave an impression matching the quality bar?" Full detail:
  `ENGINEERING_BOARD.md` v1.28.0.
- **v1.1.0 (2026-07-16):** First audit performed (see "First Audit — 2026-07-16" above). Found and
  fixed 3 compounding bugs in the app's single most-used action (Quick Capture from Goals/Habits) —
  `TECH_DEBT.md` RI-8/RI-9/RI-10 — logged 2 real Content/Visual-Language friction observations and
  a timing baseline without fixing them (pillars still undefined), and logged one dev-tool artifact
  (Item 29) found incidentally, not a Polish finding itself.
- **v1.0.0 (2026-07-16):** Created at Product Polish's kickoff, alongside `ENGINEERING_BOARD.md`
  v1.25.0 and `PROJECT_STATUS.md` v1.31.0. Five Pillars and Principios recorded as given; all
  pillar standards still undefined — that's this milestone's first real work.
