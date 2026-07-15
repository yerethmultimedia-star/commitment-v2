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
import { useSession } from '@/core/auth/use-session';

const PRIORITY_RANK: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 1, low: 2 };

/**
 * Picks a task from today's single highest-priority ACTIVE commitment — the
 * commitment's own priority drives which "project" today's focus comes from,
 * not the task's. Within that one commitment, the highest-priority pending
 * task today is shown (falls back to any of its pending-today tasks if none
 * carry a priority that breaks the tie). If the top commitment has no
 * pending task today, this returns null rather than reaching into a
 * lower-priority commitment — a task from a lesser priority wouldn't
 * honestly represent "today's top priority." Ties (commitment or task) keep
 * array order — neither model has a time-of-day field to break ties more
 * precisely than that.
 */
function computePriorityTask(
  todayTasks: { id: string; title: string; priority: 'high' | 'medium' | 'low'; commitmentId?: string | null; status: string }[],
  allTasks: { commitmentId?: string | null; status: string }[],
  commitments: { id: string; title: string; status: string; priority: 'high' | 'medium' | 'low' }[],
): DashboardPriorityTask | null {
  const activeCommitments = commitments.filter((c) => c.status === 'active');
  if (activeCommitments.length === 0) return null;

  const topCommitment = [...activeCommitments].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  )[0]!;

  const candidates = todayTasks.filter((t) => t.commitmentId === topCommitment.id);
  if (candidates.length === 0) return null;

  const top = [...candidates].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])[0]!;

  const commitmentTasks = allTasks.filter((t) => t.commitmentId === topCommitment.id);
  const commitmentProgressRatio = commitmentTasks.length > 0
    ? commitmentTasks.filter((t) => t.status === 'completed').length / commitmentTasks.length
    : 0;

  return {
    taskId: top.id,
    title: top.title,
    priority: top.priority,
    commitmentId: topCommitment.id,
    commitmentTitle: topCommitment.title,
    commitmentProgressRatio,
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

  // Bootstrap gate: both queries below are `enabled: Boolean(identityId)`, so
  // while Zustand is still rehydrating identityId from storage they report
  // isLoading=false (disabled, not loading) rather than "waiting." Without this
  // guard, isError below would briefly (or, if hydration is slow, not so
  // briefly) evaluate true on every load — identityId reads null but isLoading
  // has already gone false — showing the Error state before auth ever gets a
  // chance to resolve. Treating "auth not yet hydrated" as its own loading
  // state closes that race.
  const isLoading = !isHydrated || commitmentsLoading || tasksLoading || allTasksLoading || habitsLoading;

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
      priorityTask: computePriorityTask(taskData?.today ?? [], allTasks, commitments),
      snapshotAt: new Date().toISOString(),
    };
  }, [isLoading, identityId, commitments, taskData, allTasks, habits]);

  return { context, isLoading, isError };
}
