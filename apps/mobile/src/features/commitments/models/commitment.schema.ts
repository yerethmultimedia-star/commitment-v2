import { z } from 'zod/v4';
import { TFunction } from 'i18next';

export const createCommitmentSchema = (t: TFunction) => {
  return z.object({
    title: z.string().min(3, { message: t('form.errors.titleTooShort', { ns: 'commitments' }) }),
    description: z.string().optional(),
    targetDate: z.date().optional().nullable(),
    recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  });
};

export type CommitmentFormValues = z.infer<ReturnType<typeof createCommitmentSchema>>;
