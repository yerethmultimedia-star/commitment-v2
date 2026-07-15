import { ValueObject } from '../../shared/value-object.js';
import { InvalidHabitRecurrenceError } from '../errors/habit-errors.js';

export enum HabitRecurrenceType {
  Daily = 'Daily',
  Workdays = 'Workdays',
  Weekly = 'Weekly',
  Biweekly = 'Biweekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
}

interface HabitRecurrenceProps {
  type: HabitRecurrenceType;
  /** 0=Sunday..6=Saturday. Populated for Weekly/Biweekly (user-chosen) and
   *  Daily/Workdays (fixed), empty for Monthly/Yearly. */
  daysOfWeek: readonly number[];
  /** 1-31. Populated for Monthly/Yearly, null otherwise. */
  dayOfMonth: number | null;
  /** 0-11. Populated for Yearly only, null otherwise. */
  month: number | null;
}

const WORKDAYS: readonly number[] = [1, 2, 3, 4, 5];
const ALL_DAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

/**
 * iOS Reminders-style recurrence: one `type` plus only the params that type
 * needs. Day-of-month/month clamping for short months (e.g. Monthly on the
 * 31st, or Yearly on Feb 29) is NOT done here — this VO stores the raw
 * chosen values; clamping happens at occurrence-evaluation time in the
 * engine functions (is-habit-due-on.ts / compute-next-occurrence.ts), so a
 * habit set for "the 31st" is never silently rewritten to "the 30th".
 */
export class HabitRecurrence extends ValueObject<HabitRecurrenceProps> {
  private constructor(props: HabitRecurrenceProps) {
    super(props);
  }

  public get type(): HabitRecurrenceType {
    return this.props.type;
  }

  public get daysOfWeek(): readonly number[] {
    return this.props.daysOfWeek;
  }

  public get dayOfMonth(): number | null {
    return this.props.dayOfMonth;
  }

  public get month(): number | null {
    return this.props.month;
  }

  public static daily(): HabitRecurrence {
    return new HabitRecurrence({ type: HabitRecurrenceType.Daily, daysOfWeek: ALL_DAYS, dayOfMonth: null, month: null });
  }

  public static workdays(): HabitRecurrence {
    return new HabitRecurrence({ type: HabitRecurrenceType.Workdays, daysOfWeek: WORKDAYS, dayOfMonth: null, month: null });
  }

  public static weekly(daysOfWeek: readonly number[]): HabitRecurrence {
    const days = normalizeDaysOfWeek(daysOfWeek);
    if (days.length === 0) {
      throw new InvalidHabitRecurrenceError('Weekly recurrence requires at least one day of the week.');
    }
    return new HabitRecurrence({ type: HabitRecurrenceType.Weekly, daysOfWeek: days, dayOfMonth: null, month: null });
  }

  public static biweekly(daysOfWeek: readonly number[]): HabitRecurrence {
    const days = normalizeDaysOfWeek(daysOfWeek);
    if (days.length === 0) {
      throw new InvalidHabitRecurrenceError('Biweekly recurrence requires at least one day of the week.');
    }
    return new HabitRecurrence({ type: HabitRecurrenceType.Biweekly, daysOfWeek: days, dayOfMonth: null, month: null });
  }

  public static monthly(dayOfMonth: number): HabitRecurrence {
    if (!isValidDayOfMonth(dayOfMonth)) {
      throw new InvalidHabitRecurrenceError('Monthly recurrence requires a day of month between 1 and 31.');
    }
    return new HabitRecurrence({ type: HabitRecurrenceType.Monthly, daysOfWeek: [], dayOfMonth, month: null });
  }

  public static yearly(month: number, dayOfMonth: number): HabitRecurrence {
    if (!Number.isInteger(month) || month < 0 || month > 11) {
      throw new InvalidHabitRecurrenceError('Yearly recurrence requires a month between 0 and 11.');
    }
    if (!isValidDayOfMonth(dayOfMonth)) {
      throw new InvalidHabitRecurrenceError('Yearly recurrence requires a day of month between 1 and 31.');
    }
    return new HabitRecurrence({ type: HabitRecurrenceType.Yearly, daysOfWeek: [], dayOfMonth, month });
  }

  /** Rehydrates from persisted/event-payload data (e.g. Daily/Workdays' fixed day sets are re-derived, not trusted from the payload). */
  public static fromProps(props: {
    type: HabitRecurrenceType;
    daysOfWeek: readonly number[];
    dayOfMonth: number | null;
    month: number | null;
  }): HabitRecurrence {
    switch (props.type) {
      case HabitRecurrenceType.Daily:
        return HabitRecurrence.daily();
      case HabitRecurrenceType.Workdays:
        return HabitRecurrence.workdays();
      case HabitRecurrenceType.Weekly:
        return HabitRecurrence.weekly(props.daysOfWeek);
      case HabitRecurrenceType.Biweekly:
        return HabitRecurrence.biweekly(props.daysOfWeek);
      case HabitRecurrenceType.Monthly:
        return HabitRecurrence.monthly(props.dayOfMonth as number);
      case HabitRecurrenceType.Yearly:
        return HabitRecurrence.yearly(props.month as number, props.dayOfMonth as number);
      default:
        throw new InvalidHabitRecurrenceError(`Unknown habit recurrence type: ${props.type as string}`);
    }
  }
}

function normalizeDaysOfWeek(daysOfWeek: readonly number[]): number[] {
  const days = [...new Set(daysOfWeek)].sort((a, b) => a - b);
  if (days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
    throw new InvalidHabitRecurrenceError('Days of week must be integers between 0 (Sunday) and 6 (Saturday).');
  }
  return days;
}

function isValidDayOfMonth(dayOfMonth: number): boolean {
  return Number.isInteger(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31;
}
