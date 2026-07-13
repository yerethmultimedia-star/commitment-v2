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
 *   DashboardStateRenderer        (loading / error gates)
 *   DashboardContent + DashboardRenderer (maps descriptor → widgets)
 *
 * Empty state policy:
 *   Only shows EmptyState when user has explicitly zero commitments AND zero
 *   pending tasks (i.e., genuinely empty account, not API error / offline).
 *   API errors degrade gracefully: dashboard renders with empty data.
 */

import React, { useMemo } from 'react';
import { DashboardStateRenderer, DashboardState } from '../components/DashboardStateRenderer';
import { DashboardContent } from '../components/DashboardContent';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';

export function DashboardScreen() {
  const { layout, isLoading, isError } = useDashboardLayout();

  const currentState = useMemo(() => {
    if (isLoading) return DashboardState.Loading;
    // isError only propagates when auth is missing — not for API errors.
    if (isError) return DashboardState.Error;
    if (!layout) return DashboardState.Loading;
    return DashboardState.Ready;
  }, [isLoading, isError, layout]);

  return (
    <DashboardStateRenderer state={currentState}>
      {layout && <DashboardContent layout={layout} />}
    </DashboardStateRenderer>
  );
}
