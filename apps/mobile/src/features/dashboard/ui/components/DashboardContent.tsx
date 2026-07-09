import React, { useEffect } from 'react';
import { YStack, ScrollView, Text } from 'tamagui';
import { DashboardHeader } from './DashboardHeader.js';
import { WidgetRenderer } from './WidgetRenderer.js';
import { useDashboardStore } from '../../store/use-dashboard-store.js';
import { useSession } from '@/core/auth/use-session.js';

export interface DashboardContentProps {
  activeCommitmentsCount: number;
}

export const DashboardContent = React.memo(function DashboardContent({ activeCommitmentsCount }: DashboardContentProps) {
  const { identityId } = useSession();
  const { getVisibleWidgets, load, isLoading } = useDashboardStore();
  
  useEffect(() => {
    if (identityId) {
      load(identityId);
    }
  }, [identityId, load]);

  const visibleWidgets = getVisibleWidgets();

  return (
    <ScrollView 
      flex={1} 
      backgroundColor="$background" 
      contentContainerStyle={{ padding: '$4', paddingBottom: '$8' }}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap="$6">
        <DashboardHeader commitmentsCount={activeCommitmentsCount} />
        
        {isLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$10">
            <Text color="$contentSecondary">Loading layout...</Text>
          </YStack>
        ) : (
          <YStack gap="$4">
            {visibleWidgets.map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} />
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
});
