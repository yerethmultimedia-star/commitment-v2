import { HabitRecurrence, HabitRecurrenceType } from '@commitment/domain';

/** Shared by register/edit command handlers to build a HabitRecurrence VO from raw command fields. */
export function buildHabitRecurrence(
  type: string,
  daysOfWeek: number[] = [],
  dayOfMonth?: number,
  month?: number,
): HabitRecurrence {
  switch (type as HabitRecurrenceType) {
    case HabitRecurrenceType.Daily:
      return HabitRecurrence.daily();
    case HabitRecurrenceType.Workdays:
      return HabitRecurrence.workdays();
    case HabitRecurrenceType.Weekly:
      return HabitRecurrence.weekly(daysOfWeek);
    case HabitRecurrenceType.Biweekly:
      return HabitRecurrence.biweekly(daysOfWeek);
    case HabitRecurrenceType.Monthly:
      return HabitRecurrence.monthly(dayOfMonth as number);
    case HabitRecurrenceType.Yearly:
      return HabitRecurrence.yearly(month as number, dayOfMonth as number);
    default:
      throw new Error(`Unknown habit recurrence type: ${type}`);
  }
}
