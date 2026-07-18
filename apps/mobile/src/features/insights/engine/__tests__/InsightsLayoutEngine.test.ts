/**
 * InsightsLayoutEngine.resolveOverview — determinism & correctness tests
 */

import { resolveOverview } from '../InsightsLayoutEngine';
import { INSIGHTS_OVERVIEW_SCHEMA_VERSION } from '../InsightsOverviewDescriptor';
import { InsightsContext, GoalInsightSummary } from '@commitment/domain';

function goal(overrides: Partial<GoalInsightSummary> & { goalId: string }): GoalInsightSummary {
  return {
    title: 'Test Goal',
    state: 'Active',
    progress: 0.5,
    activeCommitments: 1,
    completedCommitments: 0,
    habitsOnTrack: 0,
    habitsAtRisk: 0,
    completedAt: null,
    ...overrides,
  };
}

const emptyWeekWindow = { goalsCompleted: 0, tasksCompleted: 0, productivity: 0, totalFocusMinutes: 0, avgFocusMinutesPerDay: 0 };

const emptyContext: InsightsContext = {
  userId: 'test-user',
  goals: [],
  overall: { completionRate: 0, completedThisWeek: 0, activeGoalsCount: 0, completedGoalsCount: 0, bestStreakDays: 0 },
  dailyActivity: [],
  dailyMetrics: [],
  thisWeek: emptyWeekWindow,
  lastWeek: emptyWeekWindow,
  weekActivityFlags: [
    { date: '2026-07-13', completed: true, isFuture: false },
    { date: '2026-07-14', completed: false, isFuture: false },
    { date: '2026-07-15', completed: false, isFuture: false },
    { date: '2026-07-16', completed: false, isFuture: true },
    { date: '2026-07-17', completed: false, isFuture: true },
    { date: '2026-07-18', completed: false, isFuture: true },
    { date: '2026-07-19', completed: false, isFuture: true },
  ],
  snapshotAt: '2026-07-15T10:00:00.000Z',
};

describe('InsightsLayoutEngine.resolveOverview', () => {
  describe('schemaVersion', () => {
    it('always returns schemaVersion 1', () => {
      const layout = resolveOverview(emptyContext);
      expect(layout.schemaVersion).toBe(INSIGHTS_OVERVIEW_SCHEMA_VERSION);
      expect(layout.schemaVersion).toBe(1);
    });
  });

  describe('determinism', () => {
    it('produces identical output for identical inputs', () => {
      const context: InsightsContext = { ...emptyContext, goals: [goal({ goalId: 'g-01' })] };
      const layout1 = resolveOverview(context);
      const layout2 = resolveOverview(context);
      expect(JSON.stringify(layout1)).toBe(JSON.stringify(layout2));
    });
  });

  describe('time range', () => {
    it('always exposes all 4 ranges as available, only week as enabled', () => {
      const layout = resolveOverview(emptyContext);
      expect(layout.availableRanges).toEqual(['week', 'month', 'quarter', 'year']);
      expect(layout.enabledRanges).toEqual(['week']);
      expect(layout.activeRange).toBe('week');
    });
  });

  describe('statCards', () => {
    it('always returns exactly 4 cards, in fixed order', () => {
      const layout = resolveOverview(emptyContext);
      expect(layout.statCards.map((c) => c.id)).toEqual(['goalsCompleted', 'tasksCompleted', 'productivity', 'focusMinutes']);
    });

    it('computes each delta as thisWeek.X - lastWeek.X', () => {
      const context: InsightsContext = {
        ...emptyContext,
        thisWeek: { goalsCompleted: 2, tasksCompleted: 10, productivity: 80, totalFocusMinutes: 210, avgFocusMinutesPerDay: 30 },
        lastWeek: { goalsCompleted: 1, tasksCompleted: 14, productivity: 60, totalFocusMinutes: 175, avgFocusMinutesPerDay: 25 },
      };
      const layout = resolveOverview(context);
      const byId = Object.fromEntries(layout.statCards.map((c) => [c.id, c]));
      expect(byId.goalsCompleted.delta).toBe(1);
      expect(byId.tasksCompleted.delta).toBe(-4);
      expect(byId.productivity.delta).toBe(20);
      expect(byId.focusMinutes.delta).toBe(5);
    });

    it('handles a negative delta correctly (not clamped to 0)', () => {
      const context: InsightsContext = {
        ...emptyContext,
        thisWeek: { ...emptyWeekWindow, tasksCompleted: 2 },
        lastWeek: { ...emptyWeekWindow, tasksCompleted: 9 },
      };
      const layout = resolveOverview(context);
      expect(layout.statCards.find((c) => c.id === 'tasksCompleted')!.delta).toBe(-7);
    });

    it('handles a zero delta', () => {
      const context: InsightsContext = {
        ...emptyContext,
        thisWeek: { ...emptyWeekWindow, tasksCompleted: 5 },
        lastWeek: { ...emptyWeekWindow, tasksCompleted: 5 },
      };
      const layout = resolveOverview(context);
      expect(layout.statCards.find((c) => c.id === 'tasksCompleted')!.delta).toBe(0);
    });

    it('builds sparklines only from elapsed (non-future) days this week', () => {
      const context: InsightsContext = {
        ...emptyContext,
        dailyMetrics: [
          { date: '2026-07-13', tasksCompleted: 3, focusMinutes: 30, goalsCompleted: 1 },
          { date: '2026-07-14', tasksCompleted: 1, focusMinutes: 10, goalsCompleted: 0 },
          { date: '2026-07-15', tasksCompleted: 2, focusMinutes: 20, goalsCompleted: 1 },
          // no entries for 07-16..07-19 — they're future, dailyMetrics never has them
        ],
      };
      const layout = resolveOverview(context);
      const byId = Object.fromEntries(layout.statCards.map((c) => [c.id, c]));
      expect(byId.tasksCompleted.sparkline).toEqual([3, 1, 2]);
      expect(byId.focusMinutes.sparkline).toEqual([30, 10, 20]);
      // goalsCompleted sparkline is cumulative, not raw per-day
      expect(byId.goalsCompleted.sparkline).toEqual([1, 1, 2]);
    });

    it('rescales the productivity sparkline 0-100 against the tasksCompleted series max', () => {
      const context: InsightsContext = {
        ...emptyContext,
        dailyMetrics: [
          { date: '2026-07-13', tasksCompleted: 2, focusMinutes: 0, goalsCompleted: 0 },
          { date: '2026-07-14', tasksCompleted: 4, focusMinutes: 0, goalsCompleted: 0 },
          { date: '2026-07-15', tasksCompleted: 1, focusMinutes: 0, goalsCompleted: 0 },
        ],
      };
      const layout = resolveOverview(context);
      expect(layout.statCards.find((c) => c.id === 'productivity')!.sparkline).toEqual([50, 100, 25]);
    });
  });

  describe('weekActivity', () => {
    it('passes through context.weekActivityFlags unchanged', () => {
      const layout = resolveOverview(emptyContext);
      expect(layout.weekActivity).toEqual(emptyContext.weekActivityFlags);
    });
  });

  describe('edge cases', () => {
    it('handles an all-zero, no-history context without crashing', () => {
      expect(() => resolveOverview(emptyContext)).not.toThrow();
      const layout = resolveOverview(emptyContext);
      expect(layout.statCards.every((c) => c.delta === 0)).toBe(true);
      expect(layout.statCards.every((c) => c.sparkline.length === 0)).toBe(true);
    });
  });
});
