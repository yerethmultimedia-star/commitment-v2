import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@/shared/forms/zodResolver';
import { YStack, Button, Text } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { createCommitmentSchema, CommitmentFormValues } from '../../models/commitment.schema';
import { ControlledInput } from './ControlledInput';
import { ControlledDatePicker } from './ControlledDatePicker';
import { ControlledSelect } from './ControlledSelect';

interface Props {
  initialValues?: Partial<CommitmentFormValues>;
  onSubmit: (values: CommitmentFormValues) => Promise<void>;
  isSubmitting?: boolean;
  /** Fields to render as read-only. Driven by getEditableFields(status). */
  disabledFields?: string[];
  /** Override the submit button label (defaults to form.submit) */
  submitLabel?: string;
}

export function CommitmentForm({ initialValues, onSubmit, isSubmitting, disabledFields = [], submitLabel }: Props) {
  const { t } = useTranslation();
  
  const schema = createCommitmentSchema(t);
  
  const control = useForm<CommitmentFormValues>({
    resolver: zodResolver<CommitmentFormValues>(schema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      targetDate: initialValues?.targetDate || null,
      recurrence: initialValues?.recurrence || 'none',
      priority: initialValues?.priority || 'medium',
    },
  });

  // Cast to FieldValues-compatible control for generic child components
  const untypedControl = control.control as unknown as import('react-hook-form').Control<FieldValues>;

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
        theme="active"
        size="$5"
        marginTop="$4"
        disabled={isSubmitting}
        onPress={control.handleSubmit(onSubmit)}
        accessibilityLabel={submitLabel ?? t('form.submit', { ns: 'commitments' })}
        accessibilityState={{ disabled: !!isSubmitting }}
      >
        <Text color="$contentOnAccent" fontWeight="bold">
          {isSubmitting ? '...' : (submitLabel ?? t('form.submit', { ns: 'commitments' }))}
        </Text>
      </Button>
    </YStack>
  );
}
