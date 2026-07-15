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

export interface DashboardHabitSummary {
  readonly scheduledTodayCount: number;
  readonly completedTodayCount: number;
  /** Habits with a streak going that are not yet completed today. */
  readonly atRiskCount: number;
}

/**
 * Today's single highest-priority pending task, plus its parent commitment's
 * identity/progress — backs the "priority of the day" hero card. Null when
 * no pending-today task has a parent commitment (nothing honest to show).
 */
export interface DashboardPriorityTask {
  readonly taskId: string;
  readonly title: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly commitmentId: string;
  readonly commitmentTitle: string;
  /** 0..1 — completed/total tasks under the parent commitment, not the task's own binary state. */
  readonly commitmentProgressRatio: number;
}

export interface DashboardContext {
  readonly userId: string;
  readonly commitments: DashboardCommitmentSummary;
  readonly tasks: DashboardTaskSummary;
  readonly streak: DashboardStreakSummary;
  readonly habits: DashboardHabitSummary;
  readonly priorityTask: DashboardPriorityTask | null;
  /** ISO timestamp when this snapshot was captured */
  readonly snapshotAt: string;
}
