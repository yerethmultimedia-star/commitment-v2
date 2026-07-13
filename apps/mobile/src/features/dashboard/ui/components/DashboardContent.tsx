/**
 * DashboardContent
 *
 * Scrollable body of the Dashboard.
 * Receives a DashboardLayoutDescriptor and delegates rendering
 * to DashboardHeader (greeting + avatar) and DashboardRenderer (widgets).
 *
 * No data fetching here — all data arrives via the layout descriptor.
 */

import React, { useEffect } from 'react';
import { AppScreen, Stack } from '@commitment/design-system';
import { DashboardHeader } from './DashboardHeader';
import { DashboardRenderer } from '../screens/DashboardRenderer';
import { useDashboardStore } from '../../store/use-dashboard-store';
import { useSession } from '@/core/auth/use-session';
import { DashboardLayoutDescriptor } from '../../engine/layout/DashboardLayoutDescriptor';

export interface DashboardContentProps {
  layout: DashboardLayoutDescriptor;
}

export const DashboardContent = React.memo(function DashboardContent({
  layout,
}: DashboardContentProps) {
  const { identityId } = useSession();
  const { load } = useDashboardStore();

  // Sync the persisted DashboardLayout (widget ordering / visibility store)
  useEffect(() => {
    if (identityId) {
      load(identityId);
    }
  }, [identityId, load]);

  return (
    <AppScreen scrollable announceOnFocus="Dashboard">
      <Stack gap="$lg">
        <DashboardHeader
          commitmentsCount={layout.quickSummary.activeCommitmentsCount}
        />
        <DashboardRenderer layout={layout} />
      </Stack>
    </AppScreen>
  );
});
