import { HabitRecurrenceType } from '../value-objects/habit-recurrence.js';

/**
 * Plain-data shape the engine functions operate on (pure-function
 * convention shared with compute-goal-progress.ts / build-day-agenda.ts).
 * A HabitRecurrence VO instance satisfies this structurally, so aggregate
 * code can pass `habit.recurrence` directly without conversion.
 */
export interface HabitRecurrenceDescriptor {
  readonly type: HabitRecurrenceType;
  readonly daysOfWeek: readonly number[];
  readonly dayOfMonth: number | null;
  readonly month: number | null;
}
