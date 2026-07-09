import React, { useMemo } from 'react';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { DashboardStateRenderer, DashboardState } from '../components/DashboardStateRenderer';
import { DashboardContent } from '../components/DashboardContent';

export function DashboardScreen() {
  const { data: commitments = [], isLoading, isError, error, refetch } = useCommitments();

  // Determine Dashboard State
  const currentState = useMemo(() => {
    if (isLoading) return DashboardState.Loading;
    if (isError) return DashboardState.Error;
    if (commitments.length === 0) return DashboardState.Empty;
    return DashboardState.Ready;
  }, [isLoading, isError, commitments.length]);

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
