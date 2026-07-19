/**
 * InsightsContext
 *
 * Pure, framework-free snapshot consumed by the mobile Insights engine layer
 * (apps/mobile/src/features/insights/engine/InsightsLayoutEngine.ts), same
 * role as DashboardContext plays for the Dashboard engine. Assembled by
 * useInsightsContext — the one place allowed to read Zustand/React Query for
 * insights purposes — and never mutated after construction.
 */
export interface GoalInsightSummary {
  readonly goalId: string;
  readonly title: string;
  readonly state: string;
  /** 0..1 — already computed upstream via computeGoalProgress, never re-derived here. */
  readonly progress: number;
  readonly activeCommitments: number;
  readonly completedCommitments: number;
  /** Enabled habits linked to this goal with a current streak > 0. */
  readonly habitsOnTrack: number;
  /** Enabled habits linked to this goal that are due today and not yet completed. */
  readonly habitsAtRisk: number;
  /** ISO, null unless state === 'Completed'. */
  readonly completedAt: string | null;
}

export interface DailyActivityPoint {
  /** ISO yyyy-mm-dd. */
  readonly date: string;
  readonly completedCount: number;
}

/** One calendar day's raw metrics, used to derive both the 7-point overview sparklines and the Focus detail screen's day-by-day breakdown. */
export interface DailyMetricsPoint {
  /** ISO yyyy-mm-dd. */
  readonly date: string;
  readonly tasksCompleted: number;
  /** Sum of Task.actualMinutes for tasks completed this day. */
  readonly focusMinutes: number;
  readonly goalsCompleted: number;
  /**
   * Task Capability Completion Story 5 — "comprometido vs completado".
   * `plannedMinutes`/`completedMinutes` are both scoped by Task.dueDate
   * falling on this day (not Task.completedAt, which is what `focusMinutes`
   * above uses) — same population `WeekWindowMetrics.productivity` already
   * uses, so the two numbers describe the same cohort of tasks and are
   * directly comparable. `remainingMinutes`/`completionRatio` are pure
   * derivations, computed eagerly rather than left for consumers to
   * recompute — cheap, and keeps this the single source of truth for the
   * shape the Coach/Analytics/Calendar will read.
   */
  /** Sum of Task.estimatedMinutes for tasks due this day (any status). */
  readonly plannedMinutes: number;
  /** Sum of Task.actualMinutes for tasks due this day that are completed. */
  readonly completedMinutes: number;
  /** max(0, plannedMinutes - completedMinutes). */
  readonly remainingMinutes: number;
  /** completedMinutes / plannedMinutes, 0..1; 0 when plannedMinutes is 0. */
  readonly completionRatio: number;
}

/** Pre-aggregated totals for a calendar-week window (Mon-Sun) — computed once by useInsightsContext so the engine's delta math is a single subtraction per stat. */
export interface WeekWindowMetrics {
  readonly goalsCompleted: number;
  readonly tasksCompleted: number;
  /** 0-100 — completion rate of tasks due within the window. */
  readonly productivity: number;
  readonly totalFocusMinutes: number;
  readonly avgFocusMinutesPerDay: number;
  /** Story 5 — window sum of DailyMetricsPoint.plannedMinutes/completedMinutes. */
  readonly totalPlannedMinutes: number;
  readonly totalCompletedMinutes: number;
  readonly totalRemainingMinutes: number;
  /** totalCompletedMinutes / totalPlannedMinutes, 0..1; 0 when totalPlannedMinutes is 0. */
  readonly completionRatio: number;
}

export interface WeekActivityFlag {
  /** ISO yyyy-mm-dd. */
  readonly date: string;
  /** At least one task completed this day. */
  readonly completed: boolean;
  /** This date hasn't happened yet in the current calendar week — must not render as "missed." */
  readonly isFuture: boolean;
}

export interface InsightsOverallSummary {
  /** 0-100. */
  readonly completionRate: number;
  readonly completedThisWeek: number;
  readonly activeGoalsCount: number;
  readonly completedGoalsCount: number;
  readonly bestStreakDays: number;
}

export interface InsightsContext {
  readonly userId: string;
  readonly goals: readonly GoalInsightSummary[];
  readonly overall: InsightsOverallSummary;
  /** Last 7 days, oldest first, built from real Task.completedAt timestamps. */
  readonly dailyActivity: readonly DailyActivityPoint[];
  /** Last 14 days, oldest first — backs both thisWeek/lastWeek window aggregation and the Focus detail screen's day-by-day chart. */
  readonly dailyMetrics: readonly DailyMetricsPoint[];
  /** Current calendar week (Mon-Sun so far). */
  readonly thisWeek: WeekWindowMetrics;
  /** Previous calendar week (Mon-Sun). */
  readonly lastWeek: WeekWindowMetrics;
  /** Mon-Sun for the current calendar week, oldest (Mon) first. */
  readonly weekActivityFlags: readonly WeekActivityFlag[];
  readonly snapshotAt: string;
}
