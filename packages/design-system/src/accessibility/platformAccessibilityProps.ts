import { Platform } from 'react-native';
import { resolveInteractiveElement, resolveFocusVisibleStyle } from './resolveInteractiveElement.js';

/**
 * Single point of adaptation for React Native accessibility props on web.
 *
 * Root cause (verified 2026-07-15, not assumed): `@tamagui/core`'s
 * accessibility-prop-to-ARIA translation exists ONLY in its native build
 * (`createOptimizedView.native.js` — confirmed by grepping the installed
 * package; the web build has no `aria-label`/accessibility handling at
 * all). Tamagui is not a react-native-web wrapper on web — it renders its
 * own primitives straight to DOM elements — so `accessibilityLabel`,
 * `accessibilityHint`, `accessibilityRole`, and `accessibilityState` all
 * pass through untranslated and land on the DOM as unrecognized custom
 * attributes, producing a React warning per prop, per render.
 *
 * Every Design System base component must route its accessibility props
 * through this function instead of spreading them directly onto a Tamagui
 * primitive — this is the ONE place that knows about `Platform.OS`, not
 * each component individually (see the project's own rule against
 * `Platform.OS === 'web'` checks scattered across components).
 */
// Accepts RN's own (non-indexable) `AccessibilityState` shape as well as a
// plain record, so callers can pass either `ViewProps['accessibilityState']`
// directly or an ad-hoc object without a cast.
export type AccessibilityStateInput = Record<string, unknown> | {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
};

export interface PlatformAccessibilityInput {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: AccessibilityStateInput;
  /** RN's shape for conveying a control's current value (sliders, switches with a text value, etc.) — maps to `aria-valuetext`/`aria-valuenow` on web. */
  accessibilityValue?: { text?: string; now?: number; min?: number; max?: number };
}

// RN role names that don't match their ARIA counterpart 1:1. Anything not
// listed here passes through unchanged (button/checkbox/switch/tab/tablist/
// progressbar/link/image are all identical in both vocabularies).
const ROLE_MAP: Record<string, string | null> = {
  header: 'heading',
  // RN's "text" role marks static text as an accessible unit — ARIA has no
  // matching role; omitting `role` entirely leaves the element's native
  // semantics (already correct for a text node) untouched.
  text: null,
};

function mapAccessibilityRole(role: string): string | undefined {
  if (role in ROLE_MAP) {
    const mapped = ROLE_MAP[role];
    return mapped ?? undefined;
  }
  return role;
}

// Every accessibilityState key this codebase actually uses (verified via
// grep, not guessed) maps 1:1 to an `aria-*` boolean attribute of the same
// name — add here if a new key is introduced, don't assume it maps itself.
const STATE_KEY_MAP: Record<string, string> = {
  disabled: 'aria-disabled',
  selected: 'aria-selected',
  checked: 'aria-checked',
  busy: 'aria-busy',
  expanded: 'aria-expanded',
};

function mapAccessibilityState(state: AccessibilityStateInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    const ariaKey = STATE_KEY_MAP[key];
    if (ariaKey && value !== undefined) out[ariaKey] = value;
  }
  return out;
}

export function toPlatformAccessibilityProps(input: PlatformAccessibilityInput): Record<string, unknown> {
  if (Platform.OS !== 'web') {
    const out: Record<string, unknown> = {};
    if (input.accessibilityLabel !== undefined) out.accessibilityLabel = input.accessibilityLabel;
    if (input.accessibilityHint !== undefined) out.accessibilityHint = input.accessibilityHint;
    if (input.accessibilityRole !== undefined) out.accessibilityRole = input.accessibilityRole;
    if (input.accessibilityState !== undefined) out.accessibilityState = input.accessibilityState;
    if (input.accessibilityValue !== undefined) out.accessibilityValue = input.accessibilityValue;
    return out;
  }

  const out: Record<string, unknown> = {};
  if (input.accessibilityLabel !== undefined) out['aria-label'] = input.accessibilityLabel;
  // accessibilityHint has no reliable single-attribute ARIA equivalent
  // (aria-describedby needs a referenced element's id, which callers of
  // this helper don't have) — discarded on web rather than forced into an
  // approximate mapping that could read oddly to screen reader users. This
  // matches the explicit rule: no reasonable equivalent -> drop it, don't
  // invent one.
  if (input.accessibilityRole !== undefined) {
    const role = mapAccessibilityRole(input.accessibilityRole);
    if (role) out.role = role;
  }
  if (input.accessibilityState !== undefined) {
    Object.assign(out, mapAccessibilityState(input.accessibilityState));
  }
  // TD-015: a Tamagui `<div role="button">` is never keyboard-reachable —
  // `role` is ARIA sugar, not focusability. Render as the real native
  // element the role calls for (a `<button>`, most commonly) instead of
  // bolting on `tabIndex`/custom `onKeyDown` — the browser then handles
  // focus order and Enter/Space activation itself. Never applied to a
  // disabled element (a disabled control shouldn't be a Tab stop).
  const disabled =
    input.accessibilityState != null && 'disabled' in input.accessibilityState
      ? (input.accessibilityState as { disabled?: boolean }).disabled === true
      : false;
  if (!disabled) {
    // Two deliberately separate questions, composed here rather than
    // fused into one function — see resolveInteractiveElement.ts for why:
    // semantic HTML/ARIA (what element this role needs) and focus
    // appearance (what `reset.css` requires us to supply back) have
    // different reasons to exist and different lifetimes.
    const element = resolveInteractiveElement(input.accessibilityRole);
    if (element) {
      out.render = element;
      out.tabIndex = 0;
      const focusVisibleStyle = resolveFocusVisibleStyle(element);
      if (focusVisibleStyle) out.focusVisibleStyle = focusVisibleStyle;
    }
  }
  if (input.accessibilityValue !== undefined) {
    const { text, now, min, max } = input.accessibilityValue;
    if (text !== undefined) out['aria-valuetext'] = text;
    if (now !== undefined) out['aria-valuenow'] = now;
    if (min !== undefined) out['aria-valuemin'] = min;
    if (max !== undefined) out['aria-valuemax'] = max;
  }
  return out;
}
