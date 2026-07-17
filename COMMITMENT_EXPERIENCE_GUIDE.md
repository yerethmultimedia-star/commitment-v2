# Commitment v2 — Experience Guide

Version: 1.2.0
Status: Active
Owner: Principal Architect (user) + Design
Last Updated: 2026-07-16

---

This is **not** a technical document — `ARCHITECTURE.md` owns structure, `PRODUCT_POLISH_GUIDE.md`
owns the Five Pillars and how audits are run. This document is what those pillars actually check
_against_: Commitment's own Human Interface Guide, with concrete rules and numbers instead of
principles. Where `PRODUCT_POLISH_GUIDE.md` says a pillar's `Status: objective defined, no
concrete rules chosen`, the rules chosen here are what fills that gap.

**Written before auditing any more screens, on purpose.** Grading a screen against "does this feel
premium" without a stable, comparable standard means every audit depends on that day's judgment
call. This document exists so Today, Habits, Goals, and everything after get graded against the
same rules, not a fresh impression each time.

---

## 1. Ritmo Visual (Visual Rhythm)

Grounded in the spacing scale that already exists (`ResolvedTheme.spacing`:
`0/4/8/12/16/24/32/48/64`, tokens `$0`–`$8`) — this section says _which_ token to use _when_, not a
parallel scale.

- **Horizontal screen padding:** `$4` (16px), always. No screen pads narrower or wider than this
  without a named exception.
- **Section spacing** (gap between distinct sections on one screen, e.g. "Prioridad del Día" →
  "Agenda de Hoy"): `$6` (32px). Distinguishes "new section" from "related content" at a glance.
- **Intra-section spacing** (gap between items inside one section, e.g. rows in an agenda list):
  `$4` (16px).
- **Card internal padding:** `$4` (16px) on all sides. Compact variants (list rows rendered as
  cards) may drop to `$3` (12px) — never below.
- **Card minimum height:** 64px for a single-line row card (list-style), 96px for any card carrying
  a title + metadata + progress (the pattern `StatCard`/`GoalCard`/`HabitCard` already use). A card
  shorter than these reads as cramped; taller without more content reads as padded-for-no-reason.
- **When to use a Card:** the content is a discrete, tappable, or independently-meaningful unit
  (a Goal, a Habit, a Task, a stat). A card implies "this is a thing," not "this is a row of data."
- **When to use a plain List row** (no card chrome — border/divider only): the content is one of
  many homogeneous items in a sequence the user scans top-to-bottom rather than compares
  side-by-side (e.g. a settings list, a simple checklist). If every row would otherwise look like
  an identical card, it should be a list instead — repeating card chrome with no visual variation
  is itself a rhythm violation.
- **When to use a Hero** (the large, single-focus block at the top of a screen — Today's Priority
  card, Goal Workspace's progress header): at most **one** Hero per screen, always the first thing
  rendered, always answering "what matters most here" per the Jerarquía test below. A screen with
  two Hero-weight elements has no hierarchy — see §2.

---

## 2. Jerarquía (Hierarchy)

Every screen must be able to answer three questions, in this order, just from a glance (no
scrolling, no reading dense text):

1. **¿Qué debo mirar primero?** — one element, unambiguous. If a first-time viewer's eye could
   land on two different things, this fails.
2. **¿Qué debo hacer después?** — the primary CTA (see Interaction pillar's "one dominant CTA"
   rule) must be visually reachable from the answer to question 1 without hunting.
3. **¿Qué puedo ignorar?** — secondary/tertiary content must visibly recede (smaller type, muted
   color, later position) rather than compete. If everything on screen has similar visual weight,
   nothing does.

**How this maps to weight:** exactly three visual weights per screen — primary (the Hero /
question-1 answer), secondary (supporting cards/sections), tertiary (metadata, captions,
timestamps). A screen using a fourth distinct weight has over-differentiated; a screen collapsing
secondary and tertiary into one weight has under-differentiated. This is also why **Densidad**
below caps typographic levels at three — it's the same rule stated as a hard limit.

---

## 3. Densidad (Density)

- **Maximum 5 visual elements per card** — icon, title, 1-2 metadata lines, a status/value, a
  progress indicator each count as one element. A card needing a 6th is asking to be split into a
  card + a detail screen, not to grow.
- **Maximum 2 visible actions per card** — matches the existing Principios rule
  (`PRODUCT_POLISH_GUIDE.md`), restated here as the concrete number. A 3rd action goes behind a
  long-press/context-menu (see Interaction pillar), never a 3rd visible button/icon.
- **Maximum 3 typographic levels per screen** — Title, Body, Caption (matching the Design System's
  own `Title`/`Body`/`Caption` components exactly — this rule is why there are only three, not a
  coincidence). A screen reaching for a 4th distinct size is manufacturing hierarchy it hasn't
  earned through layout instead.

---

## 4. Microcopy

Commitment writes like a coach who respects your time, not like a system logging an operation.

**Never:**

> Error.

**Siempre:**

> No pudimos guardar este hábito.

**Never:**

> Create Goal.

**Siempre:**

> Create your first goal. _(or the localized equivalent — specificity over genericness, always)_

**Rules:**

- **Every error names what failed, in plain terms.** "No pudimos guardar este hábito" tells you
  what didn't happen. "Error" tells you nothing happened, somewhere. Technical detail (status
  codes, stack traces) never appears in user-facing copy — that belongs in logs, not the screen.
- **Empty states are specific to what's missing, not generic.** "No hay elementos" is banned;
  "Aún no tienes objetivos activos" (or the true first-time-empty variant, "Create your first
  goal") names the actual thing the user would create next.
- **Second person, direct address.** "Tu progreso," never "El progreso del usuario." Matches the
  Coach's own voice — the whole app should read like the Coach is the one talking, not a fourth
  wall of UI labels.
- **CTAs name the object, not the verb alone.** "Nueva tarea," not "Nuevo." "Crear objetivo," not
  "Crear." A button whose label works identically on every screen in the app is under-specified.
- **Numbers get context, not just magnitude.** A raw delta ("-79") without framing is data, not
  communication — see the Color section below for how this resolves for negative metrics
  specifically (the exact case the first Product Polish audit flagged in Insights,
  `PRODUCT_POLISH_GUIDE.md` "First Audit — 2026-07-16").

---

## 5. Motion

**Implemented and verified end-to-end, 2026-07-16** (`TECH_DEBT.md` RI-11/RI-12) —
`ResolvedTheme.motion` carries these exact values in all 4 themes, `packages/design-system`'s
Tamagui config exposes them as named presets consumed via `transition="buttonPress"` etc. (not
`animation=` — a Tamagui version-specific rename, see RI-12), and real presses on real components
(the Goals FAB, Switch rows) show genuine mid-transition interpolation, confirmed via Playwright,
not just a code read.

Real numbers, mapped directly onto the fields `ResolvedTheme.motion` already declares
(`packages/theme-engine`) — this section is what fills those in, not a new system.

```text
buttonPress       120ms   ease-out            (press feedback: scale/opacity, not position)
cardEntrance      220ms   ease-out            (fade + slight rise, 8px, on first appearance)
listAnimation      40ms   ease-out, staggered (per-item delay when a list populates)
pageTransition    300ms   ease-in-out         (screen-to-screen, matches native platform feel)
modalTransition    spring (mass: 1, damping: 26, stiffness: 300) — the standard sheet/dialog/
                          Portal-content entrance; tuned for "settles quickly, no bounce-past"
```

`fast` / `normal` / `slow` (the generic three-tier fallback already in `ResolvedTheme.motion`) map
to `120ms` / `220ms` / `300ms` respectively — i.e. `fast = buttonPress`, `normal = cardEntrance`,
`slow = pageTransition`. Any interaction not explicitly named above uses whichever of these three
matches its weight, rather than inventing a bespoke duration.

**Curves:** `ease-out` for anything appearing/responding to user input (feels immediate — starts
fast, settles); `ease-in-out` for anything moving between two existing states (a page transition
isn't "arriving," it's "changing"); `spring` reserved for physical/direct-manipulation surfaces
(bottom sheets, drag-to-dismiss) where a snap-to-rest feel is correct and a fixed duration would
feel mechanical.

**When to animate vs. not:** animate state changes a user caused directly (tap, toggle, submit,
swipe) and content that enters the screen for the first time. Don't animate content that's simply
re-rendering due to unrelated state (a background refetch shouldn't cause visible motion in
elements the user isn't looking at) — this is also a correctness signal: if fixing RI-9/RI-10's
class of bug (missing invalidation / in-place mutation) ever makes a list "pop" a new item in
without `listAnimation`, that's the tell the surrounding data changed silently rather than in
response to the user's own action.

**Reduced Motion:** already correctly wired (`AppearanceProvider.tsx` skips the crossfade
entirely, `ThemeResolver` zeroes `fast`/`normal`/`slow` to 0 when the setting is on) — this
section's numbers are exactly what gets zeroed, no additional plumbing needed.

---

## 6. Color

Not from the theme's palette structure (that's `ARCHITECTURE.md`/`theme-engine` territory) — from
what each color is _allowed to mean_ to the user, consistently, regardless of which of the 4
themes is active.

- **Verde (success across all 4 themes, and Forest's own accent):** completion, achievement,
  "on track." Reserved for things that already happened correctly — a completed Habit, a Task
  marked done, a Goal above its expected pace. Never used for a neutral/default state; if
  something is green, it earned it.
- **Rojo (danger across all 4 themes):** reserved for destructive actions (delete, archive-
  permanently, cancel) and genuinely critical alerts (a missed commitment past its deadline, a
  failed save). **Never used to frame a declining-but-not-critical metric** — this directly
  resolves the first Product Polish audit's finding (Insights' wall of red negative deltas,
  `PRODUCT_POLISH_GUIDE.md` "First Audit — 2026-07-16"): "Productividad -79 vs. semana anterior" is
  a trend, not a failure, and should never render in the same red as "you missed this." Trends
  below a comparison point use a neutral/muted tone (`$contentSecondary`) with the delta rendered
  as content ("-79 vs. semana anterior"), not alarm-colored — the number already communicates
  direction; color shouldn't add urgency the situation doesn't have.
- **Ámbar/warning:** "needs attention, not urgent" — a Task due soon but not overdue, a Habit at
  risk of breaking its streak today but not yet broken. The step between neutral and red; used for
  anything recoverable with action still available.
- **Dorado (not currently a token in any theme — a deliberate gap, not an oversight):** reserved
  exclusively for milestone-tier achievement — a streak crossing 7/30/100 days, a Goal reaching
  100%, a first-of-its-kind completion. Never used for routine completion (that's green's job).
  This is intentionally the rarest color in the app — if gold shows up often, it stops meaning
  "milestone." **Delight pillar note:** no component or token currently renders gold anywhere;
  defining this token and its first real use (a streak-milestone celebration) is a concrete,
  scoped Delight-pillar candidate for future Product Polish work — not built now.
- **Morado (the brand accent in Default Light/Midnight; Sunrise/Forest use amber/green as their own
  accent instead — see `theme-engine`'s per-theme `accent` token):** not emotional — it's "this is
  Commitment," reserved for primary interactive elements (the dominant CTA, active tab, selected
  state) and nothing else. Using the accent color for anything other than "this is the thing you
  can act on right now" dilutes it into decoration.

---

## 7. Sonido e Haptics

Partial support exists today (`Switch` has haptics built in per its own component; nothing else
does, and no sound exists anywhere) — this section defines the target taxonomy so future work adds
to a plan rather than improvising per-component.

- **Light impact:** toggles, checkboxes, switches (already correct on `Switch`) — anything that's a
  binary state flip with no larger consequence.
- **Medium impact:** confirmations that change real data — completing a Task/Habit, submitting a
  form, saving an edit. One tier up from light because the action is committed, not just toggled.
- **Success pattern (distinct from a single impact):** reserved for milestone-tier moments only —
  the same trigger conditions as Dorado in §6 (streak milestones, Goal completion, first-of-a-kind
  achievement). A distinct feel here is what makes these moments register as different from routine
  completion, matching the "rare on purpose" rule gold follows.
- **No sound by default.** Sound is opt-in, never assumed — silent-mode/focus conventions on both
  platforms exist for a reason, and a productivity app making unexpected noise is a fast way to
  feel un-premium. If sound is added later, it accompanies the Success pattern only, never routine
  interactions, and ships behind its own explicit setting.
- **Reduced Motion also means reduced haptics.** The existing `reducedMotion` setting
  (`AppearanceSettingsScreen`) currently only affects animation; when haptics beyond `Switch`'s
  existing light-impact get built, they should check the same setting — non-essential physical
  feedback is exactly the kind of thing "reduce motion" users are also opting out of, even though
  haptics aren't literally motion. Treat `reducedMotion` as "reduce non-essential feedback
  broadly," not narrowly as "reduce animation only."

---

## How this document gets used

`PRODUCT_POLISH_GUIDE.md`'s Five Pillars point here for concrete rules — once a pillar's `Status:`
line can say "rules defined, see `COMMITMENT_EXPERIENCE_GUIDE.md` §N" instead of "no concrete rules
chosen," a Product Polish Score grade against that pillar means something. Per the user's own
sequencing: **no further screen audits until this document exists** — it now does, so the next
Product Polish audit (Today, Habits, Goals, or wherever it resumes) is the first one with a stable,
comparable standard to grade against, not this-session's judgment call.

---

## 📜 Change History

- **v1.2.0 (2026-07-16):** §5 Motion fully verified end-to-end — the gap left open in v1.1.0
  (Tamagui's `animation` prop producing no visible transition) was root-caused via a short,
  targeted investigation and fixed: the activating prop in the installed Tamagui version is
  `transition`, not `animation`, plus a closure-binding gotcha in how `createAnimations()`'s driver
  gets extended with custom presets. Real presses on real components now show genuine interpolation.
  Full RCA: `TECH_DEBT.md` RI-12.
- **v1.1.0 (2026-07-16):** §5 Motion's values implemented, not just documented — wired into
  `ThemeMotion` (all 4 themes) and `packages/design-system`'s Tamagui animation config. Found a
  real dead-code bug along the way (`useInteractionAnimation` computed an unused `animation`
  field). Discovered a deeper, unresolved gap: Tamagui's `animation` prop still produces no visible
  CSS transition anywhere in the app's web build even when correctly wired — logged as
  `TECH_DEBT.md` Item 30, not fixed by this pass. Full detail: `TECH_DEBT.md` v1.31.0 (RI-11),
  `ENGINEERING_BOARD.md` v1.30.0.
- **v1.0.0 (2026-07-16):** Created per explicit user direction, immediately after the Five Pillars
  gained formal Objetivos (`PRODUCT_POLISH_GUIDE.md` v1.2.0) — the next step identified was not
  another screen audit but this document: concrete, numbered rules the Pillars' Objetivos can
  actually be graded against. Seven sections (Ritmo Visual, Jerarquía, Densidad, Microcopy, Motion,
  Color, Sonido e Haptics), each grounded in what already exists in the codebase (the spacing
  scale, `ResolvedTheme.motion`'s already-named fields, the existing per-theme palette) rather than
  invented from nothing. Directly resolves one open finding from the first Product Polish audit
  (Insights' red-heavy deltas, §6) with a concrete rule instead of leaving it as an open
  observation.
