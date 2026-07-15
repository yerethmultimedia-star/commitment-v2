import { HabitRecurrenceType } from '../value-objects/habit-recurrence.js';
import { HabitRecurrenceDescriptor } from './habit-recurrence-descriptor.type.js';

export type HabitRecurrenceLabelKind = 'daily' | 'workdays' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface HabitRecurrenceLabel {
  readonly kind: HabitRecurrenceLabelKind;
  /** Populated for weekly/biweekly. */
  readonly daysOfWeek: readonly number[];
  /** Populated for monthly/yearly. */
  readonly dayOfMonth: number | null;
  /** Populated for yearly. */
  readonly month: number | null;
}

/**
 * Reduces a HabitRecurrenceDescriptor to a UI-label-friendly shape. Actual
 * text formatting (day names, "Monthly on the 15th", locale) stays in the
 * mobile layer per this codebase's i18n convention — this only classifies.
 */
export function describeHabitRecurrence(recurrence: HabitRecurrenceDescriptor): HabitRecurrenceLabel {
  switch (recurrence.type) {
    case HabitRecurrenceType.Daily:
      return { kind: 'daily', daysOfWeek: [], dayOfMonth: null, month: null };
    case HabitRecurrenceType.Workdays:
      return { kind: 'workdays', daysOfWeek: [], dayOfMonth: null, month: null };
    case HabitRecurrenceType.Weekly:
      return { kind: 'weekly', daysOfWeek: recurrence.daysOfWeek, dayOfMonth: null, month: null };
    case HabitRecurrenceType.Biweekly:
      return { kind: 'biweekly', daysOfWeek: recurrence.daysOfWeek, dayOfMonth: null, month: null };
    case HabitRecurrenceType.Monthly:
      return { kind: 'monthly', daysOfWeek: [], dayOfMonth: recurrence.dayOfMonth, month: null };
    case HabitRecurrenceType.Yearly:
      return { kind: 'yearly', daysOfWeek: [], dayOfMonth: recurrence.dayOfMonth, month: recurrence.month };
    default:
      throw new Error(`describeHabitRecurrence: unknown recurrence type: ${recurrence.type as string}`);
  }
}
