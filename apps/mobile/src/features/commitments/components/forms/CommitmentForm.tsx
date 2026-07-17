import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@/shared/forms/zodResolver';
import { YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Button } from '@commitment/design-system';
import { createCommitmentSchema, CommitmentFormValues, NO_GOAL_VALUE } from '../../models/commitment.schema';
import { ControlledInput } from '@/shared/forms/ControlledInput';
import { ControlledDatePicker } from '@/shared/forms/ControlledDatePicker';
import { ControlledSelect } from '@/shared/forms/ControlledSelect';
import { useGoals } from '@/features/goals/hooks/useGoals';

interface Props {
  initialValues?: Partial<CommitmentFormValues>;
  onSubmit: (values: CommitmentFormValues) => Promise<void>;
  isSubmitting?: boolean;
  /** Fields to render as read-only. Driven by getEditableFields(status). */
  disabledFields?: string[];
  /** Override the submit button's i18n key (defaults to 'commitments:form.submit'). */
  submitLabelI18nKey?: string;
}

export function CommitmentForm({ initialValues, onSubmit, isSubmitting, disabledFields = [], submitLabelI18nKey }: Props) {
  const { t } = useTranslation();
  const { data: goals = [] } = useGoals();

  const schema = createCommitmentSchema(t);

  const control = useForm<CommitmentFormValues>({
    resolver: zodResolver<CommitmentFormValues>(schema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      targetDate: initialValues?.targetDate || null,
      recurrence: initialValues?.recurrence || 'none',
      priority: initialValues?.priority || 'medium',
      // "Ninguno" (NO_GOAL_VALUE) is the default — Goal linkage is opt-in, not assumed, same as Habit.
      goalId: initialValues?.goalId ?? NO_GOAL_VALUE,
    },
  });

  // Cast to FieldValues-compatible control for generic child components
  const untypedControl = control.control as unknown as import('react-hook-form').Control<FieldValues>;

  const goalOptions = [
    { value: NO_GOAL_VALUE, labelKey: 'form.fields.goal.none' },
    ...goals.map((g: any) => ({ value: g.id, label: g.title })),
  ];

  const recurrenceOptions = [
    { value: 'none', labelKey: 'form.fields.recurrence.options.none' },
    { value: 'daily', labelKey: 'form.fields.recurrence.options.daily' },
    { value: 'weekly', labelKey: 'form.fields.recurrence.options.weekly' },
    { value: 'monthly', labelKey: 'form.fields.recurrence.options.monthly' },
  ];

  const priorityOptions = [
    { value: 'low', labelKey: 'form.fields.priority.options.low' },
    { value: 'medium', labelKey: 'form.fields.priority.options.medium' },
    { value: 'high', labelKey: 'form.fields.priority.options.high' },
  ];

  return (
    <YStack gap="$4" width="100%">
      <ControlledInput
        name="title"
        control={untypedControl}
        label={t('form.fields.title.label', { ns: 'commitments' })}
        placeholder={t('form.fields.title.placeholder', { ns: 'commitments' })}
        disabled={disabledFields.includes('title')}
        accessibilityHint={disabledFields.includes('title') ? t('form.fields.readOnly', { ns: 'commitments' }) : undefined}
      />

      <ControlledSelect
        name="goalId"
        control={untypedControl}
        label={t('form.fields.goal.label', { ns: 'commitments' })}
        options={goalOptions}
        disabled={disabledFields.includes('goalId')}
      />

      <ControlledInput
        name="description"
        control={untypedControl}
        label={t('form.fields.description.label', { ns: 'commitments' })}
        placeholder={t('form.fields.description.placeholder', { ns: 'commitments' })}
        disabled={disabledFields.includes('description')}
        multiline
        numberOfLines={3}
      />

      <ControlledDatePicker
        name="targetDate"
        control={untypedControl}
        label={t('form.fields.targetDate.label', { ns: 'commitments' })}
        placeholder={t('form.fields.targetDate.placeholder', { ns: 'commitments' })}
        disabled={disabledFields.includes('targetDate')}
      />

      <ControlledSelect
        name="recurrence"
        control={untypedControl}
        label={t('form.fields.recurrence.label', { ns: 'commitments' })}
        placeholder={t('form.fields.recurrence.placeholder', { ns: 'commitments' })}
        options={recurrenceOptions}
        disabled={disabledFields.includes('recurrence')}
      />

      <ControlledSelect
        name="priority"
        control={untypedControl}
        label={t('form.fields.priority.label', { ns: 'commitments' })}
        placeholder={t('form.fields.priority.placeholder', { ns: 'commitments' })}
        options={priorityOptions}
        disabled={disabledFields.includes('priority')}
      />

      <Button
        variant="primary"
        size="large"
        loading={isSubmitting}
        onPress={control.handleSubmit(onSubmit)}
        i18nKey={submitLabelI18nKey ?? 'commitments:form.submit'}
      />
    </YStack>
  );
}
