import { HabitRecurrenceDescriptor } from './habit-recurrence-descriptor.type.js';
import { isHabitDueOn } from './is-habit-due-on.js';
import { parseDateOnly } from './date-utils.internal.js';

const MAX_SCAN_DAYS = 366;

export interface ComputeHabitStreakInput {
  recurrence: HabitRecurrenceDescriptor;
  anchorDate: Date;
  previousStreak: number;
  /** Whether the one allowed grace-miss has already been used since the last reset. */
  missedGraceUsed: boolean;
  /** ISO yyyy-mm-dd of the last completed occurrence, or null if never completed. */
  lastCompletedDate: string | null;
  /** ISO yyyy-mm-dd of the occurrence this call is about. */
  occurredOn: string;
  /** true if the user completed this occurrence; false if it was missed (e.g. a postpone crossed midnight). */
  completed: boolean;
}

export interface ComputeHabitStreakResult {
  streak: number;
  graceUsed: boolean;
  lastCompletedDate: string | null;
}

/**
 * Streak rule (confirmed with product): one missed occurrence is tolerated
 * — the streak survives and a "grace" flag is consumed — but a second
 * consecutive miss while grace is already used resets the streak to 0.
 * Grace resets back to available the next time the habit is completed.
 */
export function computeHabitStreak(input: ComputeHabitStreakInput): ComputeHabitStreakResult {
  const { recurrence, anchorDate, previousStreak, missedGraceUsed, lastCompletedDate, occurredOn, completed } = input;

  if (completed && lastCompletedDate === occurredOn) {
    // Already completed this occurrence — idempotent no-op.
    return { streak: previousStreak, graceUsed: missedGraceUsed, lastCompletedDate };
  }

  if (completed && !lastCompletedDate) {
    // First-ever completion.
    return { streak: 1, graceUsed: false, lastCompletedDate: occurredOn };
  }

  const missedBetween = lastCompletedDate
    ? countDueOccurrencesStrictlyBetween(recurrence, anchorDate, lastCompletedDate, occurredOn)
    : 0;
  const totalMissed = missedBetween + (completed ? 0 : 1);

  if (totalMissed === 0) {
    return completed
      ? { streak: previousStreak + 1, graceUsed: false, lastCompletedDate: occurredOn }
      : { streak: previousStreak, graceUsed: missedGraceUsed, lastCompletedDate };
  }

  if (totalMissed === 1 && !missedGraceUsed) {
    return completed
      ? { streak: previousStreak + 1, graceUsed: true, lastCompletedDate: occurredOn }
      : { streak: previousStreak, graceUsed: true, lastCompletedDate };
  }

  // Two or more missed occurrences, or grace already used — reset.
  return completed
    ? { streak: 1, graceUsed: false, lastCompletedDate: occurredOn }
    : { streak: 0, graceUsed: false, lastCompletedDate };
}

function countDueOccurrencesStrictlyBetween(
  recurrence: HabitRecurrenceDescriptor,
  anchorDate: Date,
  fromDateStr: string,
  toDateStr: string
): number {
  const from = parseDateOnly(fromDateStr);
  const to = parseDateOnly(toDateStr);
  const cursor = new Date(from);
  cursor.setDate(cursor.getDate() + 1);

  let count = 0;
  let iterations = 0;
  while (cursor.getTime() < to.getTime() && iterations < MAX_SCAN_DAYS) {
    if (isHabitDueOn(recurrence, cursor, anchorDate)) count++;
    cursor.setDate(cursor.getDate() + 1);
    iterations++;
  }
  return count;
}
