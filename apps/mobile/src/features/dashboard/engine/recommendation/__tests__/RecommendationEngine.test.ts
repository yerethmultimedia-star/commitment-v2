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
}>): DashboardContext => ({
  userId: 'test-user',
  commitments: {
    totalActive: overrides.totalActive ?? 2,
    totalCompleted: 0,
  },
  tasks: {
    pendingToday: overrides.pendingToday ?? 0,
    completedThisWeek: overrides.completedThisWeek ?? 0,
    upcomingCount: 0,
  },
  streak: {
    currentStreakDays: overrides.currentStreakDays ?? 0,
    longestStreakDays: 0,
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
    it('attributes all recommendations to rule-provider', () => {
      const recs = getRecommendations(
        makeContext({ pendingToday: 3, currentStreakDays: 5 }),
      );
      expect(recs.every((r) => r.source === 'rule-provider')).toBe(true);
    });
  });
});
