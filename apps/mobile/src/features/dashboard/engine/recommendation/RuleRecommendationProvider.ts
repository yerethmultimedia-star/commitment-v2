/**
 * RuleRecommendationProvider
 *
 * Default rule-based provider. Evaluates the DashboardContext and returns
 * a set of Recommendation objects driven by simple business rules.
 *
 * Rules encoded here (schemaVersion 2):
 *   1. No pending tasks today → promote 'motivation-widget'
 *   2. Active streak > 0      → promote 'current-streak-widget'
 *   3. No active commitments  → promote 'quick-actions-widget'
 *   4. Tasks pending today    → pin 'daily-focus' hero variant
 *   5. Week completions > 0   → pin 'streak' hero variant
 */

import { DashboardContext, Recommendation } from '@commitment/domain';
import { RecommendationProvider } from './RecommendationProvider';

const PROVIDER_ID = 'rule-provider';

export class RuleRecommendationProvider implements RecommendationProvider {
  readonly id = PROVIDER_ID;

  getRecommendations(context: DashboardContext): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { tasks, streak, commitments } = context;

    // Rule 1 – promote motivation widget if no tasks today
    if (tasks.pendingToday === 0) {
      recommendations.push({
        type: 'PROMOTE_WIDGET',
        targetId: 'motivation-widget',
        source: PROVIDER_ID,
        priority: 60,
      });
    }

    // Rule 2 – promote streak widget when user has an active streak
    if (streak.currentStreakDays > 0) {
      recommendations.push({
        type: 'PROMOTE_WIDGET',
        targetId: 'current-streak-widget',
        source: PROVIDER_ID,
        priority: 70,
      });
    }

    // Rule 3 – surface quick actions if no active commitments
    if (commitments.totalActive === 0) {
      recommendations.push({
        type: 'PROMOTE_WIDGET',
        targetId: 'quick-actions-widget',
        source: PROVIDER_ID,
        priority: 80,
      });
    }

    // Rule 4 – pin 'daily-focus' hero when tasks exist today
    if (tasks.pendingToday > 0) {
      recommendations.push({
        type: 'PIN_HERO',
        targetId: 'daily-focus',
        source: PROVIDER_ID,
        priority: 100,
        metadata: { count: tasks.pendingToday },
      });
    }

    // Rule 5 – pin 'streak' hero when weekly completions exist
    if (tasks.completedThisWeek > 0) {
      recommendations.push({
        type: 'PIN_HERO',
        targetId: 'streak',
        source: PROVIDER_ID,
        priority: 50,
        metadata: { count: tasks.completedThisWeek },
      });
    }

    return recommendations;
  }
}
