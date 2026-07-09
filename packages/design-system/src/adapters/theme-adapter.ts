import { ResolvedTheme } from '@commitment/theme-engine';

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
    // Inject motion as theme variables
    motionFast: motion.fast,
    motionNormal: motion.normal,
    motionSlow: motion.slow,
    // Add other mapped tokens if needed (spacing, radius, etc. usually mapped globally in tamagui config)
  };
}
