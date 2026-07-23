/**
 * InsightsOverviewDescriptor
 *
 * The output contract of InsightsLayoutEngine.resolveOverview (schemaVersion 1).
 *
 * Pure data model — no React, no UI imports. Replaces the old flat
 * insight-card InsightsLayoutDescriptor: the "Tu Progreso" overview is a
 * fixed 4-stat-card + week-activity-row layout with no runtime-varying membership,
 * so there's nothing for a Registry lookup-by-id indirection to resolve —
 * see InsightsLayoutEngine.ts's doc comment for the full reasoning.
 */

export const INSIGHTS_OVERVIEW_SCHEMA_VERSION = 1 as const;

export type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export type StatCardId = 'goalsCompleted' | 'tasksCompleted' | 'productivity' | 'focusMinutes';

export interface StatCardDescriptor {
  readonly id: StatCardId;
  readonly value: number;
  /** value - previous window's value, signed. */
  readonly delta: number;
  /** Points for the current (partial) calendar week only, oldest first — empty/short if today is early in the week. */
  readonly sparkline: readonly number[];
}

export interface WeekActivityFlagDescriptor {
  readonly date: string;
  readonly completed: boolean;
  readonly isFuture: boolean;
}

export interface InsightsOverviewDescriptor {
  readonly schemaVersion: typeof INSIGHTS_OVERVIEW_SCHEMA_VERSION;
  readonly activeRange: TimeRange;
  readonly availableRanges: readonly TimeRange[];
  readonly enabledRanges: readonly TimeRange[];
  readonly statCards: readonly StatCardDescriptor[];
  readonly weekActivity: readonly WeekActivityFlagDescriptor[];
}
