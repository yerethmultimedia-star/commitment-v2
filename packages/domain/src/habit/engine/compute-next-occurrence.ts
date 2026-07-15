import { HabitRecurrenceDescriptor } from './habit-recurrence-descriptor.type.js';
import { isHabitDueOn } from './is-habit-due-on.js';
import { startOfDay } from './date-utils.internal.js';

const MAX_SCAN_DAYS = 366;

export interface ReminderTimeOfDay {
  readonly hour: number;
  readonly minute: number;
}

/**
 * Finds the next moment (date + reminderTime) strictly after `after` that
 * the habit is due, scanning forward day by day (bounded to 366 days as a
 * defensive guard against a misconfigured recurrence looping forever).
 * Checks `after`'s own day first, so a habit due today with a reminder
 * time later today returns today; if today's time has already passed, it
 * moves to the next due day.
 */
export function computeNextOccurrence(
  recurrence: HabitRecurrenceDescriptor,
  reminderTime: ReminderTimeOfDay,
  anchorDate: Date,
  after: Date
): Date {
  const cursor = startOfDay(after);

  for (let i = 0; i <= MAX_SCAN_DAYS; i++) {
    if (isHabitDueOn(recurrence, cursor, anchorDate)) {
      const candidate = new Date(cursor);
      candidate.setHours(reminderTime.hour, reminderTime.minute, 0, 0);
      if (candidate.getTime() > after.getTime()) {
        return candidate;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  throw new Error('computeNextOccurrence: no due date found within 366 days — recurrence may be misconfigured');
}
