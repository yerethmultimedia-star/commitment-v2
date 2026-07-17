import { z } from 'zod/v4';
import { TFunction } from 'i18next';

export const NO_GOAL_VALUE = '__none__';

export const createCommitmentSchema = (t: TFunction) => {
  return z.object({
    title: z.string().min(3, { message: t('form.errors.titleTooShort', { ns: 'commitments' }) }),
    description: z.string().optional(),
    targetDate: z.date().optional().nullable(),
    recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    // ControlledSelect always emits a string — NO_GOAL_VALUE is the "no linked Goal" row, transformed to a real null here, same shape as Habit's goalId (Goal linkage is opt-in, not assumed).
    goalId: z.string().optional().nullable().transform((v) => (v === NO_GOAL_VALUE || !v ? null : v)),
  });
};

export type CommitmentFormValues = z.infer<ReturnType<typeof createCommitmentSchema>>;
