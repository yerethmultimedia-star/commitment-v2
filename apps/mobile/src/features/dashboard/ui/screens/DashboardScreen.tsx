/**
 * DashboardScreen
 *
 * Entry point for the Dashboard tab.
 *
 * Architecture (VS-031, Block A):
 *   useDashboardLayout()
 *       → useDashboardContext()   (assembles DashboardContext from stores)
 *       → RecommendationEngine    (pure, deterministic)
 *       → DashboardLayoutEngine   (pure, deterministic)
 *       → DashboardLayoutDescriptor
 *   DashboardStateRenderer        (loading / error / empty gates)
 *   DashboardRenderer             (maps descriptor → widgets)
 */

import React, { useMemo } from 'react';
import { DashboardStateRenderer, DashboardState } from '../components/DashboardStateRenderer';
import { DashboardContent } from '../components/DashboardContent';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';

export function DashboardScreen() {
  const { layout, isLoading, isError } = useDashboardLayout();

  const currentState = useMemo(() => {
    if (isLoading) return DashboardState.Loading;
    if (isError) return DashboardState.Error;
    if (!layout) return DashboardState.Loading;
    const totalActive = layout.quickSummary.activeCommitmentsCount;
    const pendingToday = layout.quickSummary.pendingTasksCount;
    if (totalActive === 0 && pendingToday === 0) return DashboardState.Empty;
    return DashboardState.Ready;
  }, [isLoading, isError, layout]);

  return (
    <DashboardStateRenderer state={currentState}>
      {layout && <DashboardContent layout={layout} />}
    </DashboardStateRenderer>
  );
}
