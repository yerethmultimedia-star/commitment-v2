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

  // Derive Weekly Progress Metrics (Mock logic for now, should come from domain logic/backend)
  const weeklyCompleted = useMemo(() => commitments.filter(c => c.status === 'completed').length, [commitments]);
  const weeklyTarget = 7; // Static for now

  // Define Quick Actions
  const quickActions = useMemo(() => [
    {
      id: 'add',
      iconToken: 'plus',
      i18nKey: 'dashboard.actionAdd',
      onPress: () => console.log('Navigate to Create Commitment'),
    },
    {
      id: 'calendar',
      iconToken: 'calendar',
      i18nKey: 'dashboard.actionCalendar',
      onPress: () => console.log('Navigate to Calendar'),
    }
  ], []);

  const handleCommitmentPress = (id: string) => {
    console.log('Navigate to commitment details:', id);
  };

  return (
    <DashboardStateRenderer 
      state={currentState} 
      errorMessage={error?.message}
    >
      <DashboardContent
        commitments={commitments}
        weeklyCompleted={weeklyCompleted}
        weeklyTarget={weeklyTarget}
        quickActions={quickActions}
        onCommitmentPress={handleCommitmentPress}
        onRefresh={refetch}
      />
    </DashboardStateRenderer>
  );
}
