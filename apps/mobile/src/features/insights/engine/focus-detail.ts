/**
 * Pure helpers backing the Focus detail screen (useFocusDetail hook) — kept
 * separate from the hook itself so best/worst-day picking is independently
 * unit-testable without mocking useInsightsContext, same reasoning as
 * daily-metrics.ts.
 */

export interface FocusDayBar {
  readonly date: string;
  readonly weekdayLabel: string;
  readonly focusMinutes: number;
}

export interface BestWorstDayResult {
  readonly bestDay: FocusDayBar | null;
  readonly worstDay: FocusDayBar | null;
}

/**
 * Picks the highest/lowest focusMinutes day among `days` (already filtered
 * to exclude future/not-yet-happened days by the caller). If every day has
 * 0 minutes, both are suppressed (null) rather than showing a misleading
 * "Mejor día: Monday (0 min)" — mirrors TopConsistencyInsight's existing
 * pattern of hiding rather than showing an empty/zero highlight.
 * Ties: first occurrence wins (stable, deterministic).
 */
export function pickBestWorstDay(days: readonly FocusDayBar[]): BestWorstDayResult {
  if (days.length === 0 || days.every((d) => d.focusMinutes === 0)) {
    return { bestDay: null, worstDay: null };
  }

  const bestDay = days.reduce<FocusDayBar | null>(
    (best, d) => (!best || d.focusMinutes > best.focusMinutes ? d : best),
    null,
  );
  const worstDay = days.reduce<FocusDayBar | null>(
    (worst, d) => (!worst || d.focusMinutes < worst.focusMinutes ? d : worst),
    null,
  );

  return { bestDay, worstDay };
}
