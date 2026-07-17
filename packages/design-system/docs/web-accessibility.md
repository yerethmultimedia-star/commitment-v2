# Web Accessibility Contract

Version: 1.0.0
Last Updated: 2026-07-15
Owner: Architecture Review Board

---

## Why this document exists

TD-015 (see `TECH_DEBT.md`) went through a full cycle before it could be
called closed: root cause → fix → regression → root cause of the
regression → fix → verification, twice over (nested `<button>`s, then
native UA chrome + lost focus visibility). Every one of those steps traced
back to the same handful of guarantees this Design System makes about any
control marked with an `accessibilityRole`. Writing them down once, here,
is cheaper than re-deriving them the next time someone touches this layer
— and it's the thing that stops a future cleanup pass from removing the
`@tamagui/core/reset.css` import in `app/_layout.tsx` because it "looks
like it doesn't do anything."

## The contract

Any control given an interactive `accessibilityRole` (`button`, `tab`,
`checkbox`, `switch` today — see `resolveInteractiveElement.ts` for the
full, reasoned list) MUST, on web:

1. **Render semantic HTML** — a real `<button>` (or the correct element for
   the role), not a `<div role="...">`. `role` alone is ARIA sugar; it
   does not make an element focusable.
2. **Be tabbable** — reachable via keyboard `Tab`, in the same order it
   appears visually.
3. **Activate with Enter.**
4. **Activate with Space.**
5. **Expose the correct ARIA role/state** (`role`, `aria-checked`,
   `aria-selected`, `aria-disabled`, etc. — see `platformAccessibilityProps.ts`).
6. **Have a visible keyboard focus indicator** — never rely on the
   browser's default outline being present; this codebase's own
   `reset.css` import removes it deliberately (see below), so something
   else must supply one.
7. **Never rely on the browser's default appearance** — a real `<button>`
   carries UA chrome (border, background, padding) that must be reset
   explicitly, not left to show through.

None of this is enforced by convention — it's produced mechanically by one
shared pipeline:

```
accessibilityRole (+ accessibilityState)
        │
        ▼
resolveInteractiveElement(role)      →  which native element? (#1, #7 the tag choice)
        │
        ▼
resolveFocusVisibleStyle(element)    →  what does focus look like? (#6)
        │
        ▼
toPlatformAccessibilityProps(...)    →  composes both + ARIA mapping (#5),
                                         returns the props object every
                                         component spreads onto its View
```

`resolveInteractiveElement` and `resolveFocusVisibleStyle` are
deliberately two separate functions (not one) — one decides semantic
HTML/ARIA, the other decides visual focus treatment. They answer different
questions with different reasons to change, composed by
`toPlatformAccessibilityProps`, not fused together.

## The two pieces that make #1–#7 actually true, and must not be removed

- **`@tamagui/core/reset.css`**, imported once in `app/_layout.tsx`.
  Without it, real `<button>` elements (produced by
  `resolveInteractiveElement`) show the browser's native chrome — this is
  exactly the regression TD-015 shipped and then had to fix same-day. This
  import has no visible effect most of the time you'd notice by casually
  reading the diff — that is not evidence it's dead code.
- **`resolveFocusVisibleStyle`**'s contribution to every interactive
  element's props. `reset.css` above turns off the browser's own focus
  outline for `button`/`input`/`select` on purpose (Tamagui's own
  primitives supply their own instead) — remove this and every raw
  `View`/`XStack`/`YStack` + `onPress` element in the app (anything not
  wrapped in this Design System's own `<FocusRing>`) goes back to being
  tabbable but invisible when focused.

## Verification checklist (what "done" means for a new interactive component)

Not a full 16-section checkpoint — just the keyboard/focus slice, since
that's what a change in this specific layer can silently break:

- [ ] Tag is the correct native element (not `<div>`) — inspect the DOM.
- [ ] Reachable via `Tab`, in visual order.
- [ ] `Enter` activates it.
- [ ] `Space` activates it.
- [ ] A focus indicator is visible on `Tab` (not just on mouse click —
      `:focus-visible`, not `:focus`).
- [ ] Rest-state (unfocused) has no native browser border/background/padding.
- [ ] Console is clean — zero React warnings, zero hydration errors (watch
      specifically for nested-interactive-element warnings if the new
      component can end up inside another clickable one).
- [ ] Native (iOS/Android) behavior unchanged — confirm nothing in this
      layer branched on `Platform.OS` to get there; the web/native split
      should already be handled upstream (by Tamagui's own `render`
      no-op on native, or by this file's `Platform.OS !== 'web'` branch).

## When to revisit this document

When `resolveInteractiveElement.ts`'s role table changes (a new role gets
mapped, e.g. `link` finally gets a real `href` and becomes usable), or if
a future Tamagui upgrade changes what `reset.css` resets — the
`webButtonReset.contract.spec.ts` test guards the latter mechanically;
this document is the human-readable version of why both exist.
