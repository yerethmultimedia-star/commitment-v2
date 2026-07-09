import React, { useEffect } from 'react';
import { Stack, Body, AppScreen } from '@commitment/design-system';
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
    <AppScreen scrollable announceOnFocus="Dashboard">
      <Stack gap="$lg">
        <DashboardHeader commitmentsCount={activeCommitmentsCount} />
        
        {isLoading ? (
          <Stack flex={1} alignItems="center" justifyContent="center" padding="$10">
            <Body color="$contentSecondary">Loading layout...</Body>
          </Stack>
        ) : (
          <Stack gap="$md">
            {visibleWidgets.map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} />
            ))}
          </Stack>
        )}
      </Stack>
    </AppScreen>
  );
});
