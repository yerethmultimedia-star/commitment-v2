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
    // For example, if highContrast is true, we could dynamically adjust colors here.

    // We create a copy to avoid mutating the cached resolved theme
    const finalTheme = { ...resolvedTheme };

    if (context.reducedMotion) {
      // Zero every duration-bearing field, not just the generic fast/normal/
      // slow tier — buttonPress/cardEntrance/pageTransition/listAnimation are
      // the fields components actually read (see ThemeMotion's doc comment,
      // COMMITMENT_EXPERIENCE_GUIDE.md §5). Spring configs (spring/
      // modalTransition) are left as physical params, not zeroed — a
      // near-zero spring isn't a meaningful "off" state the way duration: 0
      // is; consumers of spring-driven motion should check
      // ResolvedAppearance.isReducedMotion directly and skip the animation
      // entirely instead, same as AppearanceProvider's own crossfade already
      // does.
      finalTheme.motion = {
        ...finalTheme.motion,
        fast: 0,
        normal: 0,
        slow: 0,
        pageTransition: 0,
        buttonPress: 0,
        cardEntrance: 0,
        listAnimation: 0,
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
