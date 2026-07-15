/**
 * InsightsLayoutEngine
 *
 * DETERMINISTIC PURE FUNCTION.
 *
 * Contract:
 *   resolveOverview(context: InsightsContext) → InsightsOverviewDescriptor
 *
 * No React, no I/O, no Zustand/React Query reads. Deliberately skips
 * assertDeterministic/__DEV__ (Dashboard's engine guard, known to break
 * under Jest) since nothing here needs it.
 *
 * Unlike the old flat insight-card layout this replaced, the overview is a
 * FIXED 4-stat-card + streak-row shape — no runtime-varying membership to
 * resolve — so there's no Registry/InsightRenderer indirection here; this
 * function just shapes context data into the descriptor directly.
 */

import { InsightsContext } from '@commitment/domain';
import {
  INSIGHTS_OVERVIEW_SCHEMA_VERSION,
  InsightsOverviewDescriptor,
  StatCardDescriptor,
  TimeRange,
} from './InsightsOverviewDescriptor';

const AVAILABLE_RANGES: readonly TimeRange[] = ['week', 'month', 'quarter', 'year'];
const ENABLED_RANGES: readonly TimeRange[] = ['week'];

/** This calendar week's dailyMetrics points that have actually happened (Mon..today) — never pads with future days, which would misrepresent "not yet happened" as "zero activity." */
function thisWeekPointsSoFar(context: InsightsContext) {
  const soFarDates = new Set(context.weekActivityFlags.filter((f) => !f.isFuture).map((f) => f.date));
  return context.dailyMetrics.filter((p) => soFarDates.has(p.date));
}

/** Rescales a series of counts to 0-100 against its own max — used for the Productivity sparkline, which reuses tasksCompleted's shape as a volume proxy rather than a literal per-day rate (see plan §4b). */
function rescaleToPercent(points: readonly number[]): number[] {
  const max = Math.max(1, ...points);
  return points.map((v) => Math.round((v / max) * 100));
}

/** Cumulative sum within the week — goal completions are sparse (0-1/day), so a raw daily count sparklines poorly; a running total is still 100% real and reads as a trend line. */
function cumulative(points: readonly number[]): number[] {
  let sum = 0;
  return points.map((v) => {
    sum += v;
    return sum;
  });
}

function resolveStatCards(context: InsightsContext): StatCardDescriptor[] {
  const soFar = thisWeekPointsSoFar(context);
  const tasksCompletedSeries = soFar.map((p) => p.tasksCompleted);
  const focusMinutesSeries = soFar.map((p) => p.focusMinutes);
  const goalsCompletedSeries = cumulative(soFar.map((p) => p.goalsCompleted));

  return [
    {
      id: 'goalsCompleted',
      value: context.thisWeek.goalsCompleted,
      delta: context.thisWeek.goalsCompleted - context.lastWeek.goalsCompleted,
      sparkline: goalsCompletedSeries,
    },
    {
      id: 'tasksCompleted',
      value: context.thisWeek.tasksCompleted,
      delta: context.thisWeek.tasksCompleted - context.lastWeek.tasksCompleted,
      sparkline: tasksCompletedSeries,
    },
    {
      id: 'productivity',
      value: context.thisWeek.productivity,
      delta: context.thisWeek.productivity - context.lastWeek.productivity,
      // Rescaled from the same per-day tasksCompleted series (0-100 against
      // the week's max) — a volume-shape proxy, not a literal per-day rate;
      // a true per-day rate would need each day's own due-task denominator,
      // which duplicates the window-scoped productivity formula above for a
      // sparkline whose only job is a rough trend indicator.
      sparkline: rescaleToPercent(tasksCompletedSeries),
    },
    {
      id: 'focusMinutes',
      value: context.thisWeek.avgFocusMinutesPerDay,
      delta: context.thisWeek.avgFocusMinutesPerDay - context.lastWeek.avgFocusMinutesPerDay,
      sparkline: focusMinutesSeries,
    },
  ];
}

/**
 * Resolve the "Tu Progreso" overview descriptor from context.
 * Deterministic: identical inputs always produce identical outputs.
 */
export function resolveOverview(context: InsightsContext): InsightsOverviewDescriptor {
  return {
    schemaVersion: INSIGHTS_OVERVIEW_SCHEMA_VERSION,
    activeRange: 'week',
    availableRanges: AVAILABLE_RANGES,
    enabledRanges: ENABLED_RANGES,
    statCards: resolveStatCards(context),
    weekActivity: context.weekActivityFlags,
  };
}
