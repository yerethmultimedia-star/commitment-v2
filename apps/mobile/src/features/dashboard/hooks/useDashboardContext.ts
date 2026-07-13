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
import { DashboardContext } from '@commitment/domain';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';
import { useSession } from '@/core/auth/use-session';

export interface UseDashboardContextResult {
  context: DashboardContext | null;
  isLoading: boolean;
  /** True only when we cannot determine the user identity (auth error). */
  isError: boolean;
}

export function useDashboardContext(): UseDashboardContextResult {
  const { identityId } = useSession();
  const {
    data: commitments = [],
    isLoading: commitmentsLoading,
  } = useCommitments();
  const {
    data: taskData,
    isLoading: tasksLoading,
  } = useDashboardQuery();

  const isLoading = commitmentsLoading || tasksLoading;

  // Only treat missing identity as a hard error. API connection errors
  // degrade gracefully (show empty data, not error screen).
  const isError = !isLoading && !identityId;

  const context = useMemo((): DashboardContext | null => {
    if (isLoading || !identityId) return null;

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
        currentStreakDays: 0,
        longestStreakDays: 0,
      },
      snapshotAt: new Date().toISOString(),
    };
  }, [isLoading, identityId, commitments, taskData]);

  return { context, isLoading, isError };
}
