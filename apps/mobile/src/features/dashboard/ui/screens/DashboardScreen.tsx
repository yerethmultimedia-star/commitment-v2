import React, { useMemo } from 'react';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { DashboardStateRenderer, DashboardState } from '../components/DashboardStateRenderer';
import { DashboardContent } from '../components/DashboardContent';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

export function DashboardScreen() {
  const { data: commitments = [], isLoading, isError, error, refetch } = useCommitments();
  const tasks = useDashboardQuery();

  // Determine Dashboard State
  const currentState = useMemo(() => {
    if (isLoading || tasks.isLoading) return DashboardState.Loading;
    if (isError || tasks.isError) return DashboardState.Error;
    if (commitments.length === 0 && !tasks.data?.metrics.pending) return DashboardState.Empty;
    return DashboardState.Ready;
  }, [isLoading, isError, commitments.length, tasks.isLoading, tasks.isError, tasks.data?.metrics.pending]);

  const activeCommitmentsCount = useMemo(() => {
    return commitments.filter(c => c.status === 'active').length;
  }, [commitments]);

  return (
    <DashboardStateRenderer 
      state={currentState} 
      errorMessage={error?.message}
    >
      <DashboardContent
        activeCommitmentsCount={activeCommitmentsCount}
      />
    </DashboardStateRenderer>
  );
}
