/**
 * useDashboardContext
 *
 * Assembles a DashboardContext snapshot from all data sources.
 * This is the ONLY place allowed to read from Zustand / React Query
 * for dashboard engine purposes.
 *
 * Returns { context, isLoading, isError }
 */

import { useMemo } from 'react';
import { DashboardContext } from '@commitment/domain';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';
import { useSession } from '@/core/auth/use-session';

export interface UseDashboardContextResult {
  context: DashboardContext | null;
  isLoading: boolean;
  isError: boolean;
}

export function useDashboardContext(): UseDashboardContextResult {
  const { identityId } = useSession();
  const {
    data: commitments = [],
    isLoading: commitmentsLoading,
    isError: commitmentsError,
  } = useCommitments();
  const {
    data: taskData,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useDashboardQuery();

  const isLoading = commitmentsLoading || tasksLoading;
  const isError = commitmentsError || tasksError;

  const context = useMemo((): DashboardContext | null => {
    if (isLoading || isError || !identityId) return null;

    const activeCommitments = commitments.filter((c) => c.status === 'active');

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
        // Defaulting to 0 until the backend returns these fields.
        currentStreakDays: 0,
        longestStreakDays: 0,
      },
      snapshotAt: new Date().toISOString(),
    };
  }, [isLoading, isError, identityId, commitments, taskData]);

  return { context, isLoading, isError };
}
