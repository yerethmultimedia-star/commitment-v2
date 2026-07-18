/**
 * useDashboardContext
 *
 * Assembles a DashboardContext snapshot from all data sources.
 * This is the ONLY place allowed to read from Zustand / React Query
 * for dashboard engine purposes.
 *
 * Error resilience policy:
 *   - API errors → degrade gracefully with empty data (no full error screen).
 *   - Only propagates isError=true for auth errors (no identityId).
 *   - This allows the Dashboard to show the empty state instead of
 *     a blank error screen when the backend is unreachable.
 */

import { useMemo } from 'react';
import { DashboardContext, DashboardPriorityTask, isHabitDueOn } from '@commitment/domain';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useDashboardQuery, useTasks } from '@/features/tasks/hooks/useTasks';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useSession } from '@/core/auth/use-session';
import { useTranslation } from 'react-i18next';

/**
 * Weights driving which pending-today task wins the "priority of the day"
 * hero. Deliberately not a fixed origin hierarchy (commitment > goal >
 * independent) — every candidate scores on the same scale regardless of
 * where it comes from, so a genuinely urgent independent task can outrank a
 * low-priority commitment task. Kept as one auditable constant rather than
 * scattered magic numbers, per VS-032 Fase 2 design doc §2.
 *
 * goalBonus removed (2026-07-18, Goal Backend Fase 4): it scaled by
 * Goal.priority, a field that turned out to be presentation-only, never
 * part of the canonical Goal domain model (see
 * goal_view_alignment_assessment.md) — the Goal aggregate has no priority.
 * Ranking now ignores Goal-specific bonus until product defines Goal
 * priority as an actual domain concept; that would be a domain evolution
 * decided separately, not part of this integration.
 */
export const PRIORITY_TASK_SCORE_WEIGHTS = {
  priority: { high: 30, medium: 15, low: 0 } as Record<'high' | 'medium' | 'low', number>,
  activeCommitmentBonus: 10,
};

interface PriorityTaskCandidate {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  commitmentId?: string | null;
  goalId?: string | null;
  status: string;
}

/**
 * Scores every pending-today task regardless of origin (commitment-linked,
 * goal-linked directly, or fully independent) and returns the highest
 * scorer. Ties keep array order — neither model has a time-of-day field to
 * break ties more precisely than that. Returns null only when there is no
 * pending task due today at all.
 */
function computePriorityTask(
  todayTasks: PriorityTaskCandidate[],
  allTasks: { commitmentId?: string | null; status: string }[],
  commitments: { id: string; title: string; status: string }[],
  goals: { id: string; title: string; state: string; commitmentIds: readonly string[] }[],
  personalFallbackLabel: string,
): DashboardPriorityTask | null {
  if (todayTasks.length === 0) return null;

  const commitmentsById = new Map(commitments.map((c) => [c.id, c]));
  const goalsById = new Map(goals.map((g) => [g.id, g]));
  const goalByCommitmentId = new Map<string, (typeof goals)[number]>();
  for (const goal of goals) {
    for (const commitmentId of goal.commitmentIds) goalByCommitmentId.set(commitmentId, goal);
  }

  // Only resolves a Commitment's Goal when the Commitment itself is active —
  // a task on a cancelled/paused commitment shouldn't inherit its (possibly
  // still-active) parent Goal's context label, since the task's own path to
  // that Goal is no longer live.
  const resolveGoal = (task: PriorityTaskCandidate) => {
    if (task.goalId) return goalsById.get(task.goalId) ?? null;
    if (task.commitmentId) {
      const commitment = commitmentsById.get(task.commitmentId);
      if (!commitment || commitment.status !== 'active') return null;
      return goalByCommitmentId.get(task.commitmentId) ?? null;
    }
    return null;
  };

  const score = (task: PriorityTaskCandidate): number => {
    let s = PRIORITY_TASK_SCORE_WEIGHTS.priority[task.priority];
    const commitment = task.commitmentId ? commitmentsById.get(task.commitmentId) : undefined;
    if (commitment && commitment.status === 'active') s += PRIORITY_TASK_SCORE_WEIGHTS.activeCommitmentBonus;
    // Goal priority is not part of the canonical Goal domain model. Until
    // product defines Goal priority as a domain concept, ranking ignores
    // any Goal-specific bonus (see PRIORITY_TASK_SCORE_WEIGHTS comment).
    return s;
  };

  const top = todayTasks.reduce((best, candidate) => (score(candidate) > score(best) ? candidate : best));

  const commitment = top.commitmentId ? commitmentsById.get(top.commitmentId) : undefined;
  const goal = resolveGoal(top);

  const commitmentProgressRatio = commitment
    ? (() => {
        const commitmentTasks = allTasks.filter((t) => t.commitmentId === commitment.id);
        return commitmentTasks.length > 0
          ? commitmentTasks.filter((t) => t.status === 'completed').length / commitmentTasks.length
          : 0;
      })()
    : undefined;

  return {
    taskId: top.id,
    title: top.title,
    priority: top.priority,
    contextLabel: goal?.title ?? commitment?.title ?? personalFallbackLabel,
    commitmentId: commitment?.id,
    commitmentTitle: commitment?.title,
    commitmentProgressRatio,
    goalId: goal?.id,
    goalTitle: goal?.title,
  };
}

export interface UseDashboardContextResult {
  context: DashboardContext | null;
  isLoading: boolean;
  /** True only when we cannot determine the user identity (auth error). */
  isError: boolean;
}

export function useDashboardContext(): UseDashboardContextResult {
  const { identityId, isHydrated } = useSession();
  const { t } = useTranslation('common');
  const {
    data: commitments = [],
    isLoading: commitmentsLoading,
  } = useCommitments();
  const {
    data: taskData,
    isLoading: tasksLoading,
  } = useDashboardQuery();
  const {
    data: allTasks = [],
    isLoading: allTasksLoading,
  } = useTasks();
  const {
    data: habits = [],
    isLoading: habitsLoading,
  } = useHabits();
  const {
    data: goals = [],
    isLoading: goalsLoading,
  } = useGoals();

  // Bootstrap gate: both queries below are `enabled: Boolean(identityId)`, so
  // while Zustand is still rehydrating identityId from storage they report
  // isLoading=false (disabled, not loading) rather than "waiting." Without this
  // guard, isError below would briefly (or, if hydration is slow, not so
  // briefly) evaluate true on every load — identityId reads null but isLoading
  // has already gone false — showing the Error state before auth ever gets a
  // chance to resolve. Treating "auth not yet hydrated" as its own loading
  // state closes that race.
  const isLoading = !isHydrated || commitmentsLoading || tasksLoading || allTasksLoading || habitsLoading || goalsLoading;

  // Only treat missing identity as a hard error, and only once hydration has
  // definitely finished. API connection errors degrade gracefully (show empty
  // data, not error screen).
  const isError = isHydrated && !isLoading && !identityId;

  const context = useMemo((): DashboardContext | null => {
    if (isLoading || !identityId) return null;

    const activeCommitments = commitments.filter((c) => c.status === 'active');
    const today = new Date();
    const scheduledTodayHabits = habits.filter(
      (h) => h.enabled && isHabitDueOn(h.recurrence, today, new Date(h.recurrenceAnchorDate)),
    );

    return {
      userId: identityId,
      commitments: {
        totalActive: activeCommitments.length,
        totalCompleted: commitments.filter((c) => c.status === 'completed').length,
      },
      tasks: {
        pendingToday: taskData?.today?.length ?? 0,
        completedThisWeek: taskData?.metrics?.completedThisWeek ?? 0,
        upcomingCount: taskData?.upcoming?.length ?? 0,
      },
      streak: {
        // currentStreak and longestStreak are not yet in the API (VS-032).
        currentStreakDays: 0,
        longestStreakDays: 0,
      },
      habits: {
        scheduledTodayCount: scheduledTodayHabits.length,
        completedTodayCount: scheduledTodayHabits.filter((h) => h.completedToday).length,
        atRiskCount: scheduledTodayHabits.filter((h) => h.currentStreakDays > 0 && !h.completedToday).length,
      },
      priorityTask: computePriorityTask(
        taskData?.today ?? [],
        allTasks,
        commitments,
        goals,
        t('dashboard.hero.priorityTask.personalContext'),
      ),
      snapshotAt: new Date().toISOString(),
    };
  }, [isLoading, identityId, commitments, taskData, allTasks, habits, goals, t]);

  return { context, isLoading, isError };
}
