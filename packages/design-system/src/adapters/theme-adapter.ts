import { ResolvedTheme } from '@commitment/theme-engine';

/**
 * Tamagui base tokens this app's *raw* (not wrapped by this Design System)
 * Tamagui primitives require internally — Button, Input, Select, Sheet,
 * Switch, Separator, the base View/Text styled primitives. Derived from an
 * exhaustive audit of every such primitive actually imported anywhere in
 * this repo (2026-07-15), not accumulated one console warning at a time —
 * see `docs/theme-compatibility-matrix.md` for the full token-by-token
 * evidence trail and rationale. Add a new entry here (and to that doc) only
 * when a *new* raw Tamagui primitive is introduced; existing coverage
 * should not need revisiting during the screen-adoption phase.
 */
function baseTamaguiTokens(resolved: ResolvedTheme): Record<string, string> {
  return {
    color: resolved.colors.contentPrimary,
    borderColor: resolved.border.color,
    // `focus` is this app's one deliberate "attention" color — already used
    // exactly this way by FocusRing.tsx's own borderColor. Both Tamagui
    // tokens exist for the same purpose (outline/focus-visible ring).
    outlineColor: resolved.colors.focus,
    borderColorFocus: resolved.colors.focus,
    // The only pseudo-state token with real, currently-shipped consequences
    // if left unmapped: @tamagui/switch applies `backgroundColor:
    // "$backgroundActive"` when `checked` and no explicit override is
    // passed — true for 3 of this app's 4 raw <Switch> usages (Demo Mode,
    // Reduced Motion, High Contrast toggles). `interactive` matches the
    // 4th usage's own explicit `checked ? '$interactive' : ...` pattern
    // (EditHabitScreen.tsx), so this isn't a new color choice.
    backgroundActive: resolved.colors.interactive,
    // This app's interaction language is opacity/scale animation (see
    // interaction/useInteractionAnimation.ts) — no Design System component
    // does a background/border color swap on hover or press. Raw Tamagui
    // primitives outside that system still ask for these tokens; mapping
    // them to the resting-state color keeps them visually inert rather
    // than introducing a color-swap treatment nothing else in the app uses.
    backgroundHover: resolved.colors.background,
    backgroundPress: resolved.colors.background,
    backgroundFocus: resolved.colors.background,
    borderColorHover: resolved.border.color,
    borderColorPress: resolved.border.color,
  };
}

/**
 * ResolvedTheme.opacity (disabled/hover/press) was defined on every theme
 * but never reached a component — adaptThemeToTamagui() only propagated
 * colors/border/motion. useInteractionAnimation.ts hardcoded its own values
 * instead (Theme Audit, Sprint de Estabilización, 2026-07-19). This closes
 * that gap the same way motionFast/etc. already reach the Tamagui theme —
 * as flat custom theme variables, read via useTheme() where needed.
 */
function opacityTamaguiTokens(resolved: ResolvedTheme): Record<string, number> {
  return {
    opacityDisabled: resolved.opacity.disabled,
    opacityHover: resolved.opacity.hover,
    opacityPress: resolved.opacity.press,
  };
}

/**
 * Adapts a generic ResolvedTheme from the Theme Engine into a Tamagui-compatible theme object.
 * This ensures Tamagui never leaks into the Theme Engine.
 */
export function adaptThemeToTamagui(resolvedTheme: ResolvedTheme, reducedMotion: boolean = false) {
  // Apply reduced motion at the adapter level
  const motion = reducedMotion ? {
    ...resolvedTheme.motion,
    fast: 0,
    normal: 0,
    slow: 0,
  } : resolvedTheme.motion;

  return {
    ...resolvedTheme.colors,
    ...baseTamaguiTokens(resolvedTheme),
    ...opacityTamaguiTokens(resolvedTheme),
    // Inject motion as theme variables
    motionFast: motion.fast,
    motionNormal: motion.normal,
    motionSlow: motion.slow,
    // Add other mapped tokens if needed (spacing, radius, etc. usually mapped globally in tamagui config)
  };
}
