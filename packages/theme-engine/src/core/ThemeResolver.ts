import { ThemeRegistry } from './ThemeRegistry.js';
import { AppearanceContext } from './AppearanceContext.js';
import { ResolvedAppearance } from './ResolvedAppearance.js';
import { ThemeId } from './ThemeManifest.js';

export class ThemeResolver {
  constructor(
    private registry: ThemeRegistry,
    private defaultThemeId: ThemeId
  ) {}

  public resolve(context: AppearanceContext): ResolvedAppearance {
    let resolvedTheme;

    try {
      resolvedTheme = this.registry.resolve(context.themeId);
    } catch (e) {
      console.warn(`[ThemeResolver] Failed to resolve requested theme: ${context.themeId}. Falling back to ${this.defaultThemeId}.`);
      resolvedTheme = this.registry.resolve(this.defaultThemeId);
    }

    // Apply any modifications to the theme based on context if necessary
    // For example, if highContrast is true, we could dynamically adjust colors here,
    // or if reducedMotion is true, we could zero out the animation durations in the resolved theme.
    
    // We create a copy to avoid mutating the cached resolved theme
    const finalTheme = { ...resolvedTheme };

    if (context.reducedMotion) {
      finalTheme.motion = {
        ...finalTheme.motion,
        fast: 0,
        normal: 0,
        slow: 0,
      };
    }

    return {
      theme: finalTheme,
      locale: context.locale,
      isReducedMotion: context.reducedMotion,
      isHighContrast: context.highContrast,
    };
  }
}
