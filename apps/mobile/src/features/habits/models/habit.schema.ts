import { z } from 'zod/v4';
import { TFunction } from 'i18next';

export const HABIT_RECURRENCE_TYPES = ['Daily', 'Workdays', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'] as const;

/** ControlledSelect (Tamagui Select) needs a real string value for its "no selection" row — Goal linkage being optional (2026-07-15 product decision) means the field must be able to represent "none" as a first-class option, not just an absent value. */
export const NO_GOAL_VALUE = '__none__';

export const createHabitSchema = (t: TFunction) => {
  return z
    .object({
      title: z.string().min(1, { message: t('habits.form.errors.titleRequired', { ns: 'common' }) }),
      recurrenceType: z.enum(HABIT_RECURRENCE_TYPES),
      daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
      dayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
      // ControlledSelect (Tamagui Select) always emits string values — coerce back to a number here.
      month: z.coerce.number().int().min(0).max(11).optional().nullable(),
      reminderTime: z.date(),
      // ControlledSelect always emits a string — NO_GOAL_VALUE is the "no linked Goal" row, transformed to a real null here so every consumer of HabitFormValues works with the same string | null shape the domain/API already use.
      goalId: z.string().optional().nullable().transform((v) => (v === NO_GOAL_VALUE || !v ? null : v)),
    })
    .superRefine((values, ctx) => {
      if ((values.recurrenceType === 'Weekly' || values.recurrenceType === 'Biweekly') && values.daysOfWeek.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: t('habits.form.errors.daysOfWeekRequired', { ns: 'common' }),
          path: ['daysOfWeek'],
        });
      }
      if ((values.recurrenceType === 'Monthly' || values.recurrenceType === 'Yearly') && !values.dayOfMonth) {
        ctx.addIssue({
          code: 'custom',
          message: t('habits.form.errors.dayOfMonthRequired', { ns: 'common' }),
          path: ['dayOfMonth'],
        });
      }
      if (values.recurrenceType === 'Yearly' && (values.month === undefined || values.month === null)) {
        ctx.addIssue({
          code: 'custom',
          message: t('habits.form.errors.monthRequired', { ns: 'common' }),
          path: ['month'],
        });
      }
    });
};

export type HabitFormValues = z.infer<ReturnType<typeof createHabitSchema>>;
