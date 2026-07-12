export interface HeroCardViewModel {
  titleI18nKey: string;
  titleParams?: Record<string, any>;
  subtitleI18nKey: string;
  subtitleParams?: Record<string, any>;
  illustration: string; // emoji or visual token
  actionRoute: string; // screen to redirect
  priority: number;
  themeVariant: 'gradient' | 'accent' | 'success';
}

export interface HeroCardStrategy {
  shouldApply(data: any): boolean;
  execute(data: any): HeroCardViewModel;
}

export class DailyFocusStrategy implements HeroCardStrategy {
  shouldApply(data: any): boolean {
    return (data?.today?.length ?? 0) > 0;
  }

  execute(data: any): HeroCardViewModel {
    const count = data?.today?.length ?? 0;
    return {
      titleI18nKey: 'dashboard.hero.dailyFocus.title',
      titleParams: { count },
      subtitleI18nKey: 'dashboard.hero.dailyFocus.subtitle',
      illustration: '🎯',
      actionRoute: '/(tabs)/today',
      priority: 100,
      themeVariant: 'accent',
    };
  }
}

export class StreakStrategy implements HeroCardStrategy {
  shouldApply(data: any): boolean {
    return (data?.metrics?.completedThisWeek ?? 0) > 0;
  }

  execute(data: any): HeroCardViewModel {
    const days = data?.metrics?.completedThisWeek ?? 0;
    return {
      titleI18nKey: 'dashboard.hero.streak.title',
      titleParams: { count: days },
      subtitleI18nKey: 'dashboard.hero.streak.subtitle',
      illustration: '🔥',
      actionRoute: '/(tabs)/insights',
      priority: 50,
      themeVariant: 'success',
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
    };
  }
}

export const heroCardStrategies: HeroCardStrategy[] = [
  new DailyFocusStrategy(),
  new StreakStrategy(),
  new DefaultStrategy(),
];

export function getActiveHeroCard(data: any): HeroCardViewModel {
  const sorted = [...heroCardStrategies].sort((a, b) => b.execute(data).priority - a.execute(data).priority);
  for (const strategy of sorted) {
    if (strategy.shouldApply(data)) {
      return strategy.execute(data);
    }
  }
  return new DefaultStrategy().execute();
}
