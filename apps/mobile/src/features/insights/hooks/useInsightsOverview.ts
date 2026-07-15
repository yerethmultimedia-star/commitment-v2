/**
 * useInsightsOverview
 *
 * Orchestrates the full pipeline:
 *   InsightsContext → InsightsLayoutEngine.resolveOverview → InsightsOverviewDescriptor
 *
 * The integration boundary between React and the pure engine layer — the
 * engine function receives data as an argument, it never reads from a store.
 * Replaces useInsightsLayout (the old flat insight-card pipeline).
 */

import { useMemo } from 'react';
import { InsightsOverviewDescriptor } from '../engine/InsightsOverviewDescriptor';
import { useInsightsContext } from './useInsightsContext';
import { resolveOverview } from '../engine/InsightsLayoutEngine';

export interface UseInsightsOverviewResult {
  overview: InsightsOverviewDescriptor | null;
  isLoading: boolean;
  isError: boolean;
}

export function useInsightsOverview(): UseInsightsOverviewResult {
  const { context, isLoading, isError } = useInsightsContext();

  const overview = useMemo((): InsightsOverviewDescriptor | null => {
    if (!context) return null;
    return resolveOverview(context);
  }, [context]);

  return { overview, isLoading, isError };
}
