import { ResolvedTheme } from '@commitment/theme-engine';

/**
 * Adapts a generic ResolvedTheme from the Theme Engine into a Tamagui-compatible theme object.
 * This ensures Tamagui never leaks into the Theme Engine.
 */
export function adaptThemeToTamagui(resolvedTheme: ResolvedTheme) {
  // Tamagui themes are essentially flat objects mapping token names to values.
  // For VS-026, we map the colors directly.
  // In VS-027, we can expand this to map radius, spacing, etc. into Tamagui's token structure.
  
  return {
    ...resolvedTheme.colors,
    // Add other mapped tokens if needed
  };
}
