/**
 * HeroCardStrategy
 *
 * @deprecated
 * This module is replaced by the DashboardLayoutEngine (Block A, VS-031).
 * The engine resolves the hero via Recommendation + DashboardLayoutEngine.resolve().
 *
 * Kept for backward compatibility during transition. Will be removed in VS-031 cleanup.
 * Do NOT add new strategies here.
 *
 * @see apps/mobile/src/features/dashboard/engine/layout/DashboardLayoutEngine.ts
 */

export interface HeroCardViewModel {
  titleI18nKey: string;
  titleParams?: Record<string, unknown>;
  subtitleI18nKey: string;
  subtitleParams?: Record<string, unknown>;
  illustration: string;
  actionRoute: string;
  priority: number;
  themeVariant: 'gradient' | 'accent' | 'success';
  dismissible: boolean;
  validUntil?: string;
}

export interface HeroCardStrategy {
  shouldApply(data: unknown): boolean;
  execute(data: unknown): HeroCardViewModel;
}

export class DailyFocusStrategy implements HeroCardStrategy {
  shouldApply(data: unknown): boolean {
    return ((data as any)?.today?.length ?? 0) > 0;
  }

  execute(data: unknown): HeroCardViewModel {
    const count = (data as any)?.today?.length ?? 0;
    return {
      titleI18nKey: 'dashboard.hero.dailyFocus.title',
      titleParams: { count },
      subtitleI18nKey: 'dashboard.hero.dailyFocus.subtitle',
      illustration: '🎯',
      actionRoute: '/(tabs)/today',
      priority: 100,
      themeVariant: 'accent',
      dismissible: false,
    };
  }
}

export class StreakStrategy implements HeroCardStrategy {
  shouldApply(data: unknown): boolean {
    return ((data as any)?.metrics?.completedThisWeek ?? 0) > 0;
  }

  execute(data: unknown): HeroCardViewModel {
    const days = (data as any)?.metrics?.completedThisWeek ?? 0;
    return {
      titleI18nKey: 'dashboard.hero.streak.title',
      titleParams: { count: days },
      subtitleI18nKey: 'dashboard.hero.streak.subtitle',
      illustration: '🔥',
      actionRoute: '/(tabs)/insights',
      priority: 50,
      themeVariant: 'success',
      dismissible: true,
    };
  }
}

export class DefaultStrategy implements HeroCardStrategy {
  shouldApply(): boolean {
    return true;
  }

  execute(): HeroCardViewModel {
    return {
      titleI18nKey: 'dashboard.hero.default.title',
      subtitleI18nKey: 'dashboard.hero.default.subtitle',
      illustration: '✨',
      actionRoute: '/(tabs)/goals',
      priority: 0,
      themeVariant: 'gradient',
      dismissible: false,
    };
  }
}

export const heroCardStrategies: HeroCardStrategy[] = [
  new DailyFocusStrategy(),
  new StreakStrategy(),
  new DefaultStrategy(),
];

export function getActiveHeroCard(data: unknown): HeroCardViewModel {
  const sorted = [...heroCardStrategies].sort(
    (a, b) => b.execute(data).priority - a.execute(data).priority,
  );
  for (const strategy of sorted) {
    if (strategy.shouldApply(data)) {
      return strategy.execute(data);
    }
  }
  return new DefaultStrategy().execute();
}
