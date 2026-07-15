import { HabitRecurrenceDescriptor } from '../engine/habit-recurrence-descriptor.type.js';

/**
 * HabitSummary
 *
 * The denormalized read-model shape for Habit — now backed by a real
 * `Habit` aggregate (packages/domain/src/habit/aggregate/habit.ts). It
 * still lives here, in the framework-free domain package, because it is
 * consumed by more than one mobile feature (Today widget, Calendar, Coach,
 * Goal Workspace) and needs one shared shape instead of each feature
 * inventing its own — the same rationale as before, just no longer
 * "not a DDD aggregate" (it now is one; this is its projection).
 */
export interface HabitSummary {
  readonly id: string;
  readonly title: string;
  readonly recurrence: HabitRecurrenceDescriptor;
  readonly reminderHour: number;
  readonly reminderMinute: number;
  /** ISO date string — see Habit.recurrenceAnchorDate; needed by isHabitDueOn/computeNextOccurrence callers. */
  readonly recurrenceAnchorDate: string;
  readonly currentStreakDays: number;
  readonly completedToday: boolean;
  /** ISO yyyy-mm-dd of the last completed occurrence, or null if never completed. Needed to compute the next streak correctly (see computeHabitStreak). */
  readonly lastCompletedDate: string | null;
  /** Whether the habit is currently active. A disabled habit keeps its
   *  history (streak, recurrence) but drops out of recurrence-driven
   *  views like "today's habits" until re-enabled. */
  readonly enabled: boolean;
  /** ISO datetime — set when the reminder has been snoozed to later today. */
  readonly postponedUntil?: string;
  /** Optional link back to the Goal that owns this habit (see Goal.linkHabit). */
  readonly goalId?: string;
}
