/**
 * Milestone
 *
 * Plain read-model shape, not a DDD aggregate — same scoping as
 * HabitSummary. A Milestone is a checkpoint owned by a Goal; it has no
 * independent lifecycle worth modeling as an aggregate yet.
 */
export interface Milestone {
  readonly id: string;
  readonly goalId: string;
  readonly title: string;
  readonly completed: boolean;
  readonly targetDate?: string;
}
