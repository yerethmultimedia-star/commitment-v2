/**
 * CoachRecommendationProvider
 *
 * Rule-based provider for the Coach screen. Evaluates the same
 * DashboardContext used by the layout engine and returns COACH_*
 * recommendations across every Coach section. No AI, no I/O —
 * deterministic rules only, same constraints as
 * RuleRecommendationProvider. targetId identifies a static, i18n-keyed
 * descriptor the Coach screen renders; the AI-backed provider that
 * eventually replaces or augments this one (VS-034) can be added to
 * recommendationConfig.ts without the Coach screen changing.
 *
 * COACH_SUGGESTED_* recommendations carry `metadata.captureType` and
 * `metadata.prefillText` — the Coach screen passes these straight to
 * Quick Capture when the user accepts the suggestion.
 */

import { DashboardContext, Recommendation } from '@commitment/domain';
import { RecommendationProvider } from './RecommendationProvider';

const PROVIDER_ID = 'coach-provider';

export class CoachRecommendationProvider implements RecommendationProvider {
  readonly id = PROVIDER_ID;

  getRecommendations(context: DashboardContext): Recommendation[] {
    return [
      ...this.priorityTips(context),
      ...this.opportunities(context),
      ...this.achievements(context),
      ...this.risks(context),
      ...this.suggestedGoals(context),
      ...this.suggestedHabits(context),
      ...this.suggestedTasks(context),
    ];
  }

  // --- Priority Recommendations (schemaVersion 1) -----------------------
  private priorityTips(context: DashboardContext): Recommendation[] {
    const { tasks, streak, commitments } = context;
    const recommendations: Recommendation[] = [];

    if (commitments.totalActive === 0) {
      recommendations.push({ type: 'COACH_TIP', targetId: 'start-first-goal', source: PROVIDER_ID, priority: 90 });
    }
    if (tasks.pendingToday > 0) {
      recommendations.push({
        type: 'COACH_TIP', targetId: 'focus-today', source: PROVIDER_ID, priority: 80,
        metadata: { count: tasks.pendingToday },
      });
    }
    if (streak.currentStreakDays > 0) {
      recommendations.push({
        type: 'COACH_TIP', targetId: 'steady-progress', source: PROVIDER_ID, priority: 70,
        metadata: { count: streak.currentStreakDays },
      });
    }
    if (tasks.completedThisWeek > 0) {
      recommendations.push({
        type: 'COACH_TIP', targetId: 'weekly-momentum', source: PROVIDER_ID, priority: 60,
        metadata: { count: tasks.completedThisWeek },
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({ type: 'COACH_TIP', targetId: 'stay-consistent', source: PROVIDER_ID, priority: 50 });
    }
    return recommendations;
  }

  // --- Opportunities ------------------------------------------------------
  private opportunities(context: DashboardContext): Recommendation[] {
    const { tasks, commitments, habits } = context;
    const recommendations: Recommendation[] = [];

    if (habits.scheduledTodayCount === 0) {
      recommendations.push({ type: 'COACH_OPPORTUNITY', targetId: 'no-habits-today', source: PROVIDER_ID, priority: 40 });
    }
    if (commitments.totalActive > 0 && tasks.upcomingCount === 0) {
      recommendations.push({ type: 'COACH_OPPORTUNITY', targetId: 'plan-ahead', source: PROVIDER_ID, priority: 35 });
    }
    return recommendations;
  }

  // --- Achievements ---------------------------------------------------------
  private achievements(context: DashboardContext): Recommendation[] {
    const { streak, commitments, habits } = context;
    const recommendations: Recommendation[] = [];

    if (streak.currentStreakDays >= 7) {
      recommendations.push({
        type: 'COACH_ACHIEVEMENT', targetId: 'consistency-milestone', source: PROVIDER_ID, priority: 45,
        metadata: { count: streak.currentStreakDays },
      });
    }
    if (commitments.totalCompleted > 0) {
      recommendations.push({
        type: 'COACH_ACHIEVEMENT', targetId: 'commitments-completed', source: PROVIDER_ID, priority: 30,
        metadata: { count: commitments.totalCompleted },
      });
    }
    if (habits.scheduledTodayCount > 0 && habits.completedTodayCount === habits.scheduledTodayCount) {
      recommendations.push({ type: 'COACH_ACHIEVEMENT', targetId: 'all-habits-done', source: PROVIDER_ID, priority: 55 });
    }
    return recommendations;
  }

  // --- Upcoming Risks -----------------------------------------------------
  private risks(context: DashboardContext): Recommendation[] {
    const { tasks, habits } = context;
    const recommendations: Recommendation[] = [];

    if (habits.atRiskCount > 0) {
      recommendations.push({
        type: 'COACH_RISK', targetId: 'habits-needing-attention', source: PROVIDER_ID, priority: 85,
        metadata: { count: habits.atRiskCount },
      });
    }
    if (tasks.pendingToday > 5) {
      recommendations.push({
        type: 'COACH_RISK', targetId: 'heavy-day', source: PROVIDER_ID, priority: 65,
        metadata: { count: tasks.pendingToday },
      });
    }
    return recommendations;
  }

  // --- Suggested Goals ------------------------------------------------------
  private suggestedGoals(context: DashboardContext): Recommendation[] {
    if (context.commitments.totalActive > 0) return [];
    return [{
      type: 'COACH_SUGGESTED_GOAL', targetId: 'first-goal', source: PROVIDER_ID, priority: 42,
      metadata: { captureType: 'goal', prefillTextKey: 'coach.suggestions.goals.firstGoal.prefill' },
    }];
  }

  // --- Suggested Habits -----------------------------------------------------
  private suggestedHabits(context: DashboardContext): Recommendation[] {
    if (context.habits.scheduledTodayCount > 0) return [];
    return [
      {
        type: 'COACH_SUGGESTED_HABIT', targetId: 'drink-water', source: PROVIDER_ID, priority: 20,
        metadata: { captureType: 'habit', prefillTextKey: 'coach.suggestions.habits.drinkWater.prefill' },
      },
      {
        type: 'COACH_SUGGESTED_HABIT', targetId: 'stretch', source: PROVIDER_ID, priority: 19,
        metadata: { captureType: 'habit', prefillTextKey: 'coach.suggestions.habits.stretch.prefill' },
      },
    ];
  }

  // --- Suggested Tasks -----------------------------------------------------
  private suggestedTasks(context: DashboardContext): Recommendation[] {
    if (context.tasks.pendingToday > 0 || context.commitments.totalActive === 0) return [];
    return [{
      type: 'COACH_SUGGESTED_TASK', targetId: 'plan-tomorrow', source: PROVIDER_ID, priority: 25,
      metadata: { captureType: 'task', prefillTextKey: 'coach.suggestions.tasks.planTomorrow.prefill' },
    }];
  }
}
