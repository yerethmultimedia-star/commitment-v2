import { HabitRecurrenceType } from '../value-objects/habit-recurrence.js';
import { HabitRecurrenceDescriptor } from './habit-recurrence-descriptor.type.js';
import { startOfDay, daysInMonth, isoWeekStart } from './date-utils.internal.js';

/**
 * Whether a habit with the given recurrence is scheduled to occur on `date`.
 *
 * - Monthly/Yearly clamp `dayOfMonth`/`month`+`dayOfMonth` to the last valid
 *   day of the target month (e.g. day 31 fires on the 30th in a 30-day
 *   month; Feb 29 fires on Feb 28 in a non-leap year) — never silently
 *   skips a month. Clamping is evaluation-time only; the stored recurrence
 *   is never rewritten.
 * - Biweekly parity is computed relative to `anchorDate`'s ISO (Monday-
 *   start) week — `anchorDate`'s week is "week 0" (due), the following
 *   week is "week 1" (not due), and so on.
 * - Always false for any date before `anchorDate`.
 */
export function isHabitDueOn(
  recurrence: HabitRecurrenceDescriptor,
  date: Date,
  anchorDate: Date
): boolean {
  const target = startOfDay(date);
  const anchor = startOfDay(anchorDate);
  if (target.getTime() < anchor.getTime()) return false;

  switch (recurrence.type) {
    case HabitRecurrenceType.Daily:
      return true;

    case HabitRecurrenceType.Workdays: {
      const day = target.getDay();
      return day >= 1 && day <= 5;
    }

    case HabitRecurrenceType.Weekly:
      return recurrence.daysOfWeek.includes(target.getDay());

    case HabitRecurrenceType.Biweekly: {
      if (!recurrence.daysOfWeek.includes(target.getDay())) return false;
      const targetWeekStart = isoWeekStart(target);
      const anchorWeekStart = isoWeekStart(anchor);
      const diffDays = Math.round((targetWeekStart.getTime() - anchorWeekStart.getTime()) / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks % 2 === 0;
    }

    case HabitRecurrenceType.Monthly: {
      const dim = daysInMonth(target.getFullYear(), target.getMonth());
      const actualDay = Math.min(recurrence.dayOfMonth ?? 1, dim);
      return target.getDate() === actualDay;
    }

    case HabitRecurrenceType.Yearly: {
      const targetMonth = recurrence.month ?? 0;
      const dim = daysInMonth(target.getFullYear(), targetMonth);
      const actualDay = Math.min(recurrence.dayOfMonth ?? 1, dim);
      return target.getMonth() === targetMonth && target.getDate() === actualDay;
    }

    default:
      return false;
  }
}
