/**
 * DashboardContext
 *
 * Immutable snapshot of the data the DashboardLayoutEngine needs.
 * This type is domain-level (pure TS, no UI framework imports).
 *
 * Consumers (RecommendationEngine, DashboardLayoutEngine) must receive this
 * value as an argument – they MUST NOT read it from Zustand, React Context,
 * or any external store.
 */

export interface DashboardCommitmentSummary {
  readonly totalActive: number;
  readonly totalCompleted: number;
}

export interface DashboardTaskSummary {
  readonly pendingToday: number;
  readonly completedThisWeek: number;
  readonly upcomingCount: number;
}

export interface DashboardStreakSummary {
  readonly currentStreakDays: number;
  readonly longestStreakDays: number;
}

export interface DashboardContext {
  readonly userId: string;
  readonly commitments: DashboardCommitmentSummary;
  readonly tasks: DashboardTaskSummary;
  readonly streak: DashboardStreakSummary;
  /** ISO timestamp when this snapshot was captured */
  readonly snapshotAt: string;
}
