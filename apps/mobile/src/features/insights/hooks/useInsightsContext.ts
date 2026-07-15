/**
 * useInsightsContext
 *
 * Assembles an InsightsContext snapshot from all data sources. This is the
 * ONLY place allowed to read from Zustand / React Query for insights engine
 * purposes — same boundary role as useDashboardContext plays for Dashboard.
 *
 * Error resilience policy mirrors useDashboardContext: API errors degrade
 * gracefully (empty data, not an error screen); isError only reflects a
 * genuine auth failure (no identityId after hydration finishes).
 */

import { useMemo } from 'react';
import { InsightsContext, GoalInsightSummary, isHabitDueOn } from '@commitment/domain';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';
import { useSession } from '@/core/auth/use-session';
import {
  computeDailyActivity,
  computeDailyMetrics,
  aggregateWeek,
  computeWeekActivityFlags,
  mondayOf,
  addDays,
} from '../engine/daily-metrics';

export interface UseInsightsContextResult {
  context: InsightsContext | null;
  isLoading: boolean;
  isError: boolean;
}

export function useInsightsContext(): UseInsightsContextResult {
  const { identityId, isHydrated } = useSession();
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const { data: commitments = [], isLoading: commitmentsLoading } = useCommitments();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardQuery();

  const isLoading = !isHydrated || goalsLoading || habitsLoading || commitmentsLoading || tasksLoading || dashboardLoading;
  const isError = isHydrated && !isLoading && !identityId;

  const context = useMemo((): InsightsContext | null => {
    if (isLoading || !identityId) return null;

    const today = new Date();

    const goalSummaries: GoalInsightSummary[] = goals.map((goal: any) => {
      const linkedCommitments = commitments.filter((c) => c.goalId === goal.id);
      const linkedHabits = habits.filter((h) => h.goalId === goal.id && h.enabled);
      const habitsOnTrack = linkedHabits.filter((h) => h.currentStreakDays > 0).length;
      const habitsAtRisk = linkedHabits.filter(
        (h) => isHabitDueOn(h.recurrence, today, new Date(h.recurrenceAnchorDate)) && !h.completedToday,
      ).length;

      return {
        goalId: goal.id,
        title: goal.title,
        category: goal.category,
        priority: goal.priority,
        state: goal.state,
        progress: goal.progress,
        activeCommitments: linkedCommitments.filter((c) => c.status === 'active').length,
        completedCommitments: linkedCommitments.filter((c) => c.status === 'completed').length,
        habitsOnTrack,
        habitsAtRisk,
        completedAt: goal.completedAt ?? null,
      };
    });

    const enabledHabits = habits.filter((h) => h.enabled);
    const bestStreakDays = enabledHabits.reduce((max, h) => Math.max(max, h.currentStreakDays), 0);

    const dailyMetrics = computeDailyMetrics(tasks, goalSummaries, today);
    const monday = mondayOf(today);
    const thisWeek = aggregateWeek(dailyMetrics, tasks, monday, addDays(monday, 7));
    const lastWeek = aggregateWeek(dailyMetrics, tasks, addDays(monday, -7), monday);
    const weekActivityFlags = computeWeekActivityFlags(tasks, today);

    return {
      userId: identityId,
      goals: goalSummaries,
      overall: {
        completionRate: dashboardData?.metrics?.completionRate ?? 0,
        completedThisWeek: dashboardData?.metrics?.completedThisWeek ?? 0,
        activeGoalsCount: goals.filter((g: any) => g.state === 'Active').length,
        completedGoalsCount: goals.filter((g: any) => g.state === 'Completed').length,
        bestStreakDays,
      },
      dailyActivity: computeDailyActivity(tasks),
      dailyMetrics,
      thisWeek,
      lastWeek,
      weekActivityFlags,
      snapshotAt: new Date().toISOString(),
    };
  }, [isLoading, identityId, goals, habits, commitments, tasks, dashboardData]);

  return { context, isLoading, isError };
}
