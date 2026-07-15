import { TFunction } from 'i18next';
import { describeHabitRecurrence, HabitRecurrenceDescriptor } from '@commitment/domain';
import { formatWeekdayIndexShort, formatMonth } from '@commitment/localization';

/** Renders a habit's recurrence as a short, localized label
 *  (e.g. "Daily", "Workdays", "Mon, Wed, Fri", "Every 2 weeks: Mon",
 *  "Monthly on day 15", "Yearly on January 15"). */
export function formatRecurrence(t: TFunction, recurrence: HabitRecurrenceDescriptor): string {
  const label = describeHabitRecurrence(recurrence);

  switch (label.kind) {
    case 'daily':
      return t('habits.recurrence.daily');
    case 'workdays':
      return t('habits.recurrence.workdays');
    case 'weekly':
      return label.daysOfWeek.map(formatWeekdayIndexShort).join(', ');
    case 'biweekly':
      return t('habits.recurrence.biweeklyOn', { days: label.daysOfWeek.map(formatWeekdayIndexShort).join(', ') });
    case 'monthly':
      return t('habits.recurrence.monthlyOn', { day: label.dayOfMonth });
    case 'yearly':
      return t('habits.recurrence.yearlyOn', {
        month: formatMonth(new Date(2026, label.month ?? 0, 1)),
        day: label.dayOfMonth,
      });
    default:
      return '';
  }
}
