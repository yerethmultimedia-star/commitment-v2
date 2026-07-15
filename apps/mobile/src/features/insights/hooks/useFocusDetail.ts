/**
 * useFocusDetail
 *
 * Backs the Focus (Enfoque) drill-down detail screen. Reuses
 * useInsightsContext's dailyMetrics rather than reading useTasks() directly
 * — keeps useInsightsContext as the single boundary hook for all Insights
 * data sourcing, and keeps the overview InsightsOverviewDescriptor lean (it
 * doesn't need to carry day-labeled bar data or best/worst day, which only
 * this screen needs).
 */

import { useMemo } from 'react';
import { useInsightsContext } from './useInsightsContext';
import { pickBestWorstDay, FocusDayBar } from '../engine/focus-detail';
import { formatWeekdayIndexShort } from '@commitment/localization';

export interface UseFocusDetailResult {
  days: readonly FocusDayBar[];
  averageMinutes: number;
  bestDay: FocusDayBar | null;
  worstDay: FocusDayBar | null;
  isLoading: boolean;
  isError: boolean;
}

export function useFocusDetail(): UseFocusDetailResult {
  const { context, isLoading, isError } = useInsightsContext();

  return useMemo((): UseFocusDetailResult => {
    if (!context) {
      return { days: [], averageMinutes: 0, bestDay: null, worstDay: null, isLoading, isError };
    }

    const soFarDates = new Set(context.weekActivityFlags.filter((f) => !f.isFuture).map((f) => f.date));
    const days: FocusDayBar[] = context.weekActivityFlags.map((flag) => {
      const metrics = context.dailyMetrics.find((p) => p.date === flag.date);
      return {
        date: flag.date,
        weekdayLabel: formatWeekdayIndexShort(new Date(`${flag.date}T00:00:00`).getDay()),
        focusMinutes: flag.isFuture ? 0 : (metrics?.focusMinutes ?? 0),
      };
    });

    const elapsedDays = days.filter((d) => soFarDates.has(d.date));
    const averageMinutes = elapsedDays.length > 0
      ? Math.round(elapsedDays.reduce((sum, d) => sum + d.focusMinutes, 0) / elapsedDays.length)
      : 0;
    const { bestDay, worstDay } = pickBestWorstDay(elapsedDays);

    return { days, averageMinutes, bestDay, worstDay, isLoading, isError };
  }, [context, isLoading, isError]);
}
