/**
 * useDashboardLayout
 *
 * Orchestrates the full pipeline:
 *   DashboardContext → RecommendationEngine → DashboardLayoutEngine → DashboardLayoutDescriptor
 *
 * This hook is the integration boundary between React and the pure engine layer.
 * The engine functions receive data as arguments — they never read from any store.
 */

import { useMemo } from 'react';
import { DashboardLayoutDescriptor } from '../engine/layout/DashboardLayoutDescriptor';
import { useDashboardContext } from './useDashboardContext';
import { getRecommendations } from '../engine/recommendation/RecommendationEngine';
import { resolve } from '../engine/layout/DashboardLayoutEngine';

export interface UseDashboardLayoutResult {
  layout: DashboardLayoutDescriptor | null;
  isLoading: boolean;
  isError: boolean;
}

export function useDashboardLayout(): UseDashboardLayoutResult {
  const { context, isLoading, isError } = useDashboardContext();

  const layout = useMemo((): DashboardLayoutDescriptor | null => {
    if (!context) return null;

    // Both calls are pure — no external reads
    const recommendations = getRecommendations(context);
    return resolve(context, recommendations);
  }, [context]);

  return { layout, isLoading, isError };
}
