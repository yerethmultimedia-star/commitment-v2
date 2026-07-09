import React from 'react';
import { YStack, ScrollView } from 'tamagui';
import { DashboardHeader } from './DashboardHeader.js';
import { TodayWidget } from './widgets/TodayWidget.js';
import { WeeklyProgressWidget } from './widgets/WeeklyProgressWidget.js';
import { QuickActionsWidget, QuickAction } from './widgets/QuickActionsWidget.js';

import { CommitmentModel } from '@/features/commitments/models/commitment.model.js';

export interface DashboardContentProps {
  commitments: CommitmentModel[];
  weeklyCompleted: number;
  weeklyTarget: number;
  quickActions: QuickAction[];
  onCommitmentPress: (id: string) => void;
  onRefresh?: () => void;
}

export const DashboardContent = React.memo(function DashboardContent({ 
  commitments, 
  weeklyCompleted, 
  weeklyTarget,
  quickActions,
  onCommitmentPress,
  onRefresh
}: DashboardContentProps) {
  
  return (
    <ScrollView 
      flex={1} 
      backgroundColor="$background" 
      contentContainerStyle={{ padding: '$4', paddingBottom: '$8' }}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap="$6">
        <DashboardHeader commitmentsCount={commitments.filter(c => c.status === 'active').length} />
        
        <YStack gap="$4">
          <TodayWidget commitments={commitments} onCommitmentPress={onCommitmentPress} />
          <WeeklyProgressWidget completed={weeklyCompleted} target={weeklyTarget} />
          <QuickActionsWidget actions={quickActions} />
        </YStack>
      </YStack>
    </ScrollView>
  );
});
