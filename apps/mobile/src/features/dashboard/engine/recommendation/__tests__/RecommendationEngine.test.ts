/**
 * RecommendationEngine — composition, deduplication, and rule correctness tests
 */

import { getRecommendations } from '../RecommendationEngine';
import { DashboardContext } from '@commitment/domain';

const makeContext = (overrides: Partial<{
  pendingToday: number;
  completedThisWeek: number;
  currentStreakDays: number;
  totalActive: number;
  totalCompleted: number;
  upcomingCount: number;
  scheduledTodayCount: number;
  completedTodayCount: number;
  atRiskCount: number;
}>): DashboardContext => ({
  userId: 'test-user',
  commitments: {
    totalActive: overrides.totalActive ?? 2,
    totalCompleted: overrides.totalCompleted ?? 0,
  },
  tasks: {
    pendingToday: overrides.pendingToday ?? 0,
    completedThisWeek: overrides.completedThisWeek ?? 0,
    upcomingCount: overrides.upcomingCount ?? 0,
  },
  streak: {
    currentStreakDays: overrides.currentStreakDays ?? 0,
    longestStreakDays: 0,
  },
  habits: {
    scheduledTodayCount: overrides.scheduledTodayCount ?? 1,
    completedTodayCount: overrides.completedTodayCount ?? 0,
    atRiskCount: overrides.atRiskCount ?? 0,
  },
  snapshotAt: '2026-01-01T10:00:00.000Z',
});

describe('RecommendationEngine', () => {
  describe('Rule: PIN_HERO daily-focus', () => {
    it('produces PIN_HERO daily-focus when pendingToday > 0', () => {
      const recs = getRecommendations(makeContext({ pendingToday: 3 }));
      const pin = recs.find((r) => r.type === 'PIN_HERO' && r.targetId === 'daily-focus');
      expect(pin).toBeDefined();
      expect(pin?.priority).toBe(100);
      expect(pin?.metadata?.count).toBe(3);
    });

    it('does NOT produce PIN_HERO daily-focus when no pending tasks', () => {
      const recs = getRecommendations(makeContext({ pendingToday: 0 }));
      const pin = recs.find((r) => r.type === 'PIN_HERO' && r.targetId === 'daily-focus');
      expect(pin).toBeUndefined();
    });
  });

  describe('Rule: PIN_HERO streak', () => {
    it('produces PIN_HERO streak when completedThisWeek > 0', () => {
      const recs = getRecommendations(makeContext({ completedThisWeek: 5 }));
      const pin = recs.find((r) => r.type === 'PIN_HERO' && r.targetId === 'streak');
      expect(pin).toBeDefined();
    });

    it('does NOT produce PIN_HERO streak when completedThisWeek = 0', () => {
      const recs = getRecommendations(makeContext({ completedThisWeek: 0 }));
      const pin = recs.find((r) => r.type === 'PIN_HERO' && r.targetId === 'streak');
      expect(pin).toBeUndefined();
    });
  });

  describe('Rule: PROMOTE_WIDGET', () => {
    it('promotes motivation-widget when no pending tasks', () => {
      const recs = getRecommendations(makeContext({ pendingToday: 0 }));
      const promote = recs.find((r) => r.type === 'PROMOTE_WIDGET' && r.targetId === 'motivation-widget');
      expect(promote).toBeDefined();
    });

    it('promotes current-streak-widget when streak > 0', () => {
      const recs = getRecommendations(makeContext({ currentStreakDays: 3 }));
      const promote = recs.find((r) => r.type === 'PROMOTE_WIDGET' && r.targetId === 'current-streak-widget');
      expect(promote).toBeDefined();
    });

    it('promotes quick-actions-widget when no active commitments', () => {
      const recs = getRecommendations(makeContext({ totalActive: 0 }));
      const promote = recs.find((r) => r.type === 'PROMOTE_WIDGET' && r.targetId === 'quick-actions-widget');
      expect(promote).toBeDefined();
    });
  });

  describe('Deduplication & ordering', () => {
    it('returns results sorted by priority descending', () => {
      const recs = getRecommendations(
        makeContext({ pendingToday: 3, completedThisWeek: 5, currentStreakDays: 7 }),
      );
      for (let i = 0; i < recs.length - 1; i++) {
        expect(recs[i]!.priority).toBeGreaterThanOrEqual(recs[i + 1]!.priority);
      }
    });

    it('does not contain duplicate (type, targetId) pairs', () => {
      const recs = getRecommendations(
        makeContext({ pendingToday: 3, completedThisWeek: 5, currentStreakDays: 7 }),
      );
      const keys = recs.map((r) => `${r.type}::${r.targetId}`);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('Source attribution', () => {
    // Two providers are composed today (rule-provider for layout
    // recommendations, coach-provider for COACH_TIP) — see
    // recommendationConfig.ts. Every recommendation must be attributed to
    // one of them, never blank/unknown.
    const KNOWN_SOURCES = new Set(['rule-provider', 'coach-provider']);

    it('attributes every recommendation to a known provider', () => {
      const recs = getRecommendations(
        makeContext({ pendingToday: 3, currentStreakDays: 5 }),
      );
      expect(recs.every((r) => KNOWN_SOURCES.has(r.source))).toBe(true);
    });

    it('attributes layout recommendations (PIN_HERO/PROMOTE_WIDGET) to rule-provider', () => {
      const recs = getRecommendations(
        makeContext({ pendingToday: 3, currentStreakDays: 5 }),
      );
      const layoutRecs = recs.filter((r) => r.type === 'PIN_HERO' || r.type === 'PROMOTE_WIDGET');
      expect(layoutRecs.length).toBeGreaterThan(0);
      expect(layoutRecs.every((r) => r.source === 'rule-provider')).toBe(true);
    });

    it('attributes COACH_TIP recommendations to coach-provider', () => {
      const recs = getRecommendations(
        makeContext({ pendingToday: 3, currentStreakDays: 5 }),
      );
      const coachRecs = recs.filter((r) => r.type === 'COACH_TIP');
      expect(coachRecs.length).toBeGreaterThan(0);
      expect(coachRecs.every((r) => r.source === 'coach-provider')).toBe(true);
    });
  });

  describe('Coach: Opportunities', () => {
    it('flags no-habits-today when nothing is scheduled today', () => {
      const recs = getRecommendations(makeContext({ scheduledTodayCount: 0 }));
      expect(recs.find((r) => r.type === 'COACH_OPPORTUNITY' && r.targetId === 'no-habits-today')).toBeDefined();
    });

    it('does not flag no-habits-today when something is scheduled', () => {
      const recs = getRecommendations(makeContext({ scheduledTodayCount: 2 }));
      expect(recs.find((r) => r.type === 'COACH_OPPORTUNITY' && r.targetId === 'no-habits-today')).toBeUndefined();
    });

    it('flags plan-ahead when active but nothing upcoming', () => {
      const recs = getRecommendations(makeContext({ totalActive: 2, upcomingCount: 0 }));
      expect(recs.find((r) => r.type === 'COACH_OPPORTUNITY' && r.targetId === 'plan-ahead')).toBeDefined();
    });
  });

  describe('Coach: Achievements', () => {
    it('celebrates a 7+ day streak', () => {
      const recs = getRecommendations(makeContext({ currentStreakDays: 7 }));
      expect(recs.find((r) => r.type === 'COACH_ACHIEVEMENT' && r.targetId === 'week-streak')).toBeDefined();
    });

    it('does not celebrate a streak under 7 days', () => {
      const recs = getRecommendations(makeContext({ currentStreakDays: 6 }));
      expect(recs.find((r) => r.type === 'COACH_ACHIEVEMENT' && r.targetId === 'week-streak')).toBeUndefined();
    });

    it('celebrates completed goals', () => {
      const recs = getRecommendations(makeContext({ totalCompleted: 3 }));
      const rec = recs.find((r) => r.type === 'COACH_ACHIEVEMENT' && r.targetId === 'commitments-completed');
      expect(rec?.metadata?.count).toBe(3);
    });

    it('celebrates a clean sweep when every scheduled habit is done', () => {
      const recs = getRecommendations(makeContext({ scheduledTodayCount: 2, completedTodayCount: 2 }));
      expect(recs.find((r) => r.type === 'COACH_ACHIEVEMENT' && r.targetId === 'all-habits-done')).toBeDefined();
    });

    it('does not claim a clean sweep when nothing was scheduled', () => {
      const recs = getRecommendations(makeContext({ scheduledTodayCount: 0, completedTodayCount: 0 }));
      expect(recs.find((r) => r.type === 'COACH_ACHIEVEMENT' && r.targetId === 'all-habits-done')).toBeUndefined();
    });
  });

  describe('Coach: Upcoming Risks', () => {
    it('flags habit streaks at risk', () => {
      const recs = getRecommendations(makeContext({ atRiskCount: 2 }));
      const rec = recs.find((r) => r.type === 'COACH_RISK' && r.targetId === 'habit-streaks-at-risk');
      expect(rec?.metadata?.count).toBe(2);
    });

    it('flags a heavy day above 5 pending tasks', () => {
      const recs = getRecommendations(makeContext({ pendingToday: 6 }));
      expect(recs.find((r) => r.type === 'COACH_RISK' && r.targetId === 'heavy-day')).toBeDefined();
    });

    it('does not flag a heavy day at 5 or fewer pending tasks', () => {
      const recs = getRecommendations(makeContext({ pendingToday: 5 }));
      expect(recs.find((r) => r.type === 'COACH_RISK' && r.targetId === 'heavy-day')).toBeUndefined();
    });
  });

  describe('Coach: Suggested Goals/Habits/Tasks', () => {
    it('suggests a first goal only when there are no active commitments', () => {
      const withGoal = getRecommendations(makeContext({ totalActive: 0 }));
      expect(withGoal.find((r) => r.type === 'COACH_SUGGESTED_GOAL')).toBeDefined();

      const withoutGoal = getRecommendations(makeContext({ totalActive: 1 }));
      expect(withoutGoal.find((r) => r.type === 'COACH_SUGGESTED_GOAL')).toBeUndefined();
    });

    it('suggests starter habits only when nothing is scheduled today', () => {
      const recs = getRecommendations(makeContext({ scheduledTodayCount: 0 }));
      const suggested = recs.filter((r) => r.type === 'COACH_SUGGESTED_HABIT');
      expect(suggested.length).toBe(2);
      expect(suggested.every((r) => r.metadata?.captureType === 'habit')).toBe(true);

      const recsWithHabits = getRecommendations(makeContext({ scheduledTodayCount: 1 }));
      expect(recsWithHabits.find((r) => r.type === 'COACH_SUGGESTED_HABIT')).toBeUndefined();
    });

    it('suggests planning tomorrow only when active but nothing pending today', () => {
      const recs = getRecommendations(makeContext({ totalActive: 1, pendingToday: 0 }));
      const rec = recs.find((r) => r.type === 'COACH_SUGGESTED_TASK');
      expect(rec?.metadata?.captureType).toBe('task');
      expect(rec?.metadata?.prefillTextKey).toBe('coach.suggestions.tasks.planTomorrow.prefill');

      const recsWithPending = getRecommendations(makeContext({ totalActive: 1, pendingToday: 2 }));
      expect(recsWithPending.find((r) => r.type === 'COACH_SUGGESTED_TASK')).toBeUndefined();
    });

    it('attributes every suggestion to coach-provider', () => {
      const recs = getRecommendations(makeContext({ totalActive: 0, scheduledTodayCount: 0 }));
      const suggestions = recs.filter((r) => r.type.startsWith('COACH_SUGGESTED_'));
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every((r) => r.source === 'coach-provider')).toBe(true);
    });
  });
});
