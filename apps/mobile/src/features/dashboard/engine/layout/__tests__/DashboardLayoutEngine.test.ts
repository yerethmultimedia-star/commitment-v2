/**
 * DashboardLayoutEngine — determinism & correctness tests
 */

import { resolve } from '../DashboardLayoutEngine';
import { LAYOUT_SCHEMA_VERSION } from '../DashboardLayoutDescriptor';
import { DashboardContext, Recommendation } from '@commitment/domain';

const baseContext: DashboardContext = {
  userId: 'test-user',
  commitments: { totalActive: 2, totalCompleted: 5 },
  tasks: { pendingToday: 3, completedThisWeek: 7, upcomingCount: 4 },
  streak: { currentStreakDays: 5, longestStreakDays: 10 },
  snapshotAt: '2026-01-01T10:00:00.000Z',
};

const noRecs: Recommendation[] = [];

describe('DashboardLayoutEngine', () => {
  describe('schemaVersion', () => {
    it('always returns schemaVersion 2', () => {
      const layout = resolve(baseContext, noRecs);
      expect(layout.schemaVersion).toBe(LAYOUT_SCHEMA_VERSION);
      expect(layout.schemaVersion).toBe(2);
    });
  });

  describe('determinism', () => {
    it('produces identical output for identical inputs', () => {
      const layout1 = resolve(baseContext, noRecs);
      const layout2 = resolve(baseContext, noRecs);
      expect(JSON.stringify(layout1)).toBe(JSON.stringify(layout2));
    });

    it('produces different hero when recommendations differ', () => {
      const withRec: Recommendation[] = [
        {
          type: 'PIN_HERO',
          targetId: 'daily-focus',
          source: 'test',
          priority: 100,
          metadata: { count: 3 },
        },
      ];
      const layout1 = resolve(baseContext, noRecs);
      const layout2 = resolve(baseContext, withRec);
      expect(layout1.hero.titleKey).not.toBe(layout2.hero.titleKey);
    });
  });

  describe('hero resolution', () => {
    it('defaults to the default hero when no PIN_HERO recommendation exists', () => {
      const layout = resolve(baseContext, noRecs);
      expect(layout.hero.titleKey).toBe('dashboard.hero.default.title');
      expect(layout.hero.themeVariant).toBe('gradient');
    });

    it('pins daily-focus hero when PIN_HERO daily-focus has highest priority', () => {
      const recs: Recommendation[] = [
        { type: 'PIN_HERO', targetId: 'daily-focus', source: 'test', priority: 100, metadata: { count: 5 } },
      ];
      const layout = resolve(baseContext, recs);
      expect(layout.hero.titleKey).toBe('dashboard.hero.dailyFocus.title');
      expect(layout.hero.themeVariant).toBe('accent');
      expect(layout.hero.dismissible).toBe(false);
      expect(layout.hero.titleParams?.count).toBe(5);
    });

    it('pins streak hero when PIN_HERO streak has highest priority', () => {
      const recs: Recommendation[] = [
        { type: 'PIN_HERO', targetId: 'streak', source: 'test', priority: 50, metadata: { count: 7 } },
      ];
      const layout = resolve(baseContext, recs);
      expect(layout.hero.titleKey).toBe('dashboard.hero.streak.title');
      expect(layout.hero.themeVariant).toBe('success');
      expect(layout.hero.dismissible).toBe(true);
    });

    it('selects higher-priority hero when two PIN_HERO recommendations exist', () => {
      const recs: Recommendation[] = [
        { type: 'PIN_HERO', targetId: 'streak', source: 'test', priority: 50, metadata: { count: 3 } },
        { type: 'PIN_HERO', targetId: 'daily-focus', source: 'test', priority: 100, metadata: { count: 5 } },
      ];
      const layout = resolve(baseContext, recs);
      expect(layout.hero.titleKey).toBe('dashboard.hero.dailyFocus.title');
    });
  });

  describe('quickSummary', () => {
    it('maps context fields correctly', () => {
      const layout = resolve(baseContext, noRecs);
      expect(layout.quickSummary.activeCommitmentsCount).toBe(2);
      expect(layout.quickSummary.pendingTasksCount).toBe(3);
      expect(layout.quickSummary.currentStreakDays).toBe(5);
    });
  });

  describe('widget sections', () => {
    it('does not include hidden widgets', () => {
      const recs: Recommendation[] = [
        { type: 'HIDE_WIDGET', targetId: 'motivation-widget', source: 'test', priority: 80 },
      ];
      const layout = resolve(baseContext, recs);
      const allWidgets = [...layout.primaryWidgets, ...layout.secondaryWidgets, ...layout.footerWidgets];
      expect(allWidgets.every((w) => w.widgetId !== 'motivation-widget')).toBe(true);
    });

    it('promotes promoted widgets to primary section', () => {
      const recs: Recommendation[] = [
        { type: 'PROMOTE_WIDGET', targetId: 'weekly-progress-widget', source: 'test', priority: 70 },
      ];
      const layout = resolve(baseContext, recs);
      const primaryIds = layout.primaryWidgets.map((w) => w.widgetId);
      expect(primaryIds).toContain('weekly-progress-widget');
    });

    it('footer widgets always appear in footerWidgets section', () => {
      const layout = resolve(baseContext, noRecs);
      const footerIds = layout.footerWidgets.map((w) => w.widgetId);
      expect(footerIds).toContain('motivation-widget');
      expect(footerIds).toContain('recent-activity-widget');
    });
  });
});
