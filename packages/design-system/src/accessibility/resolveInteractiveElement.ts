/**
 * Platform Semantic Element Resolver.
 *
 * Root cause this exists to close (TD-015, verified 2026-07-15): on web,
 * Tamagui's `View` renders a `<div>` by default. A `<div role="button">`
 * carries correct ARIA semantics but is never in the browser's tab order —
 * `role` alone does not grant focusability, and no generic Tamagui layer
 * adds Enter/Space activation for arbitrary `tabIndex` elements (only
 * Tamagui's own specialized primitives — `@tamagui/button`'s `Button`,
 * `@tamagui/switch`'s `Switch`, `@tamagui/select`'s `SelectTrigger` — do
 * this themselves, each by rendering as a real `<button>` via a `render`
 * prop). This Design System's own wrapper components never adopted that
 * mechanism, so every `Card`/`Button`/`IconButton`/`Surface`-driven
 * pressable — and any raw `View`/`XStack`/`YStack` + `onPress` elsewhere in
 * the app — silently lost keyboard operability.
 *
 * This resolver is the single place that decides, for a given
 * `accessibilityRole`, which native HTML element Tamagui should render
 * (via its `render` prop) to get real browser-native focusability and
 * Enter/Space activation for free — no custom `onKeyDown` reimplementation,
 * no per-component patching.
 *
 * This is deliberately NOT "make every interactive role a `<button>`" — a
 * role represents a real interaction pattern, and forcing all of them onto
 * one element would just trade one wrong assumption for another:
 *
 * - `button`/`tab`/`checkbox`/`switch`: simple activate-on-press semantics.
 *   A native `<button>` (with the role's own `role="..."` ARIA override
 *   layered on top, which the browser respects for assistive-tech behavior
 *   while keeping the button's native keyboard handling) is exactly right.
 * - `link`: belongs on a real `<a href="...">`, not a `<button>` — but this
 *   helper has no `href` in its input shape today (this app navigates via
 *   `router.push()`, not declarative hrefs), so an `<a>` produced here
 *   would have no `href` and would be JUST as unfocusable as the `<div>`
 *   this fix replaces. No current caller uses `accessibilityRole: 'link'`,
 *   so this is inert today — but wire an `href` through
 *   `PlatformAccessibilityInput` before any caller actually uses it, or
 *   this mapping becomes a silent regression the day someone does.
 * - `menuitem`/`treeitem`/`option`: these belong to composite widgets
 *   (menu/tree/listbox) that use *roving tabindex* — only one item in the
 *   group is ever a Tab stop at a time; arrow keys move focus within the
 *   group, Tab moves focus out of it entirely. That is a fundamentally
 *   different interaction pattern from "one independently-focusable
 *   button," and a real `<button>` here would be actively wrong (every
 *   item becomes its own Tab stop, breaking the composite pattern a
 *   screen-reader user expects). Deliberately left unmapped (`null` — no
 *   `render` override, Tamagui's default `<div>`) until a real consumer
 *   needs the full roving-tabindex pattern, which belongs in its own
 *   purpose-built primitive, not here.
 * - `text`/`header`/`tablist`/`progressbar`/anything unlisted: structural
 *   or descriptive, never independently activated — no element override.
 */

export type ResolvedInteractiveElement = 'button' | 'a';

const ELEMENT_FOR_ROLE: Record<string, ResolvedInteractiveElement | null> = {
  button: 'button',
  tab: 'button',
  checkbox: 'button',
  switch: 'button',
  link: 'a',
  // Composite-widget roles — see file header. Not `'button'`.
  menuitem: null,
  treeitem: null,
  option: null,
  // Structural/descriptive roles — never independently focusable.
  text: null,
  header: null,
  tablist: null,
  progressbar: null,
};

/**
 * Returns the native HTML element an `accessibilityRole` should render as
 * on web to be genuinely keyboard-operable, or `null` if the role is not
 * something a user activates directly (Tamagui's default `<div>` is
 * correct as-is). Unknown/unlisted roles resolve to `null` — conservative
 * by default, never guesses a focusable element for a role it doesn't
 * recognize.
 */
export function resolveInteractiveElement(role: string | undefined): ResolvedInteractiveElement | null {
  if (!role) return null;
  return ELEMENT_FOR_ROLE[role] ?? null;
}

/**
 * Deliberately a separate function from `resolveInteractiveElement`, not
 * folded into it — that one answers "what semantic HTML/ARIA does this role
 * need"; this one answers "what should focus look like on it." Different
 * questions, different lifetimes (this one exists only because of
 * `reset.css`'s `outline: none`, see below — semantic resolution doesn't
 * depend on that at all), composed together by `toPlatformAccessibilityProps`
 * rather than fused.
 *
 * Why this exists: `@tamagui/core/reset.css` (imported once, app-wide, in
 * `app/_layout.tsx` — the fix for the native `<button>` UA-chrome regression
 * `resolveInteractiveElement` itself introduced) sets `outline: none` on
 * `button`/`input`/`select`/etc. Tamagui's own interactive primitives are
 * fine with that because each supplies its own `focusVisibleStyle`. This
 * Design System's own components (`Card`, `Button`, `IconButton`, `Surface`)
 * already have a visible indicator via their own `<FocusRing>` wrapper and
 * don't need this. Every *raw* `View`/`XStack`/`YStack` + `onPress`
 * elsewhere in the app was never wrapped in `<FocusRing>` — without this,
 * those elements are tabbable but invisible when focused (WCAG 2.4.7).
 * Applying this to DS components too is intentional, not an oversight: it's
 * strictly additive (their own `<FocusRing>` still renders on top), and the
 * alternative — this function knowing which callers already have their own
 * indicator — would defeat the point of a single shared resolver.
 */
export function resolveFocusVisibleStyle(element: ResolvedInteractiveElement | null): Record<string, unknown> | undefined {
  if (!element) return undefined;
  return {
    outlineColor: '$focus',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 2,
  };
}
