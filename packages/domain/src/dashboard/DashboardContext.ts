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
 * Today's single highest-scoring pending task — backs the "priority of the
 * day" hero card. Candidates are scored regardless of origin (commitment,
 * direct goal, or fully independent); the highest score wins. Null only
 * when there is no pending task due today at all.
 *
 * `contextLabel` is always present so the hero card never has to branch its
 * visual structure by origin: resolved Goal title > Commitment title >
 * generic fallback. `commitmentId`/`goalId` and their titles are mutually
 * exclusive on the winning task itself — a commitment-linked task's Goal (if
 * any) is resolved for display via the commitment, not stored twice.
 */
export interface DashboardPriorityTask {
  readonly taskId: string;
  readonly title: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly contextLabel: string;
  readonly commitmentId?: string;
  readonly commitmentTitle?: string;
  /** 0..1 — completed/total tasks under the parent commitment. Only present when commitment-linked. */
  readonly commitmentProgressRatio?: number;
  readonly goalId?: string;
  readonly goalTitle?: string;
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
