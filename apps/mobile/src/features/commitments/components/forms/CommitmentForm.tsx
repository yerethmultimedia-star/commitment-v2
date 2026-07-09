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
}

export function CommitmentForm({ initialValues, onSubmit, isSubmitting }: Props) {
  const { t } = useTranslation();
  
  const schema = createCommitmentSchema(t);
  
  const control = useForm<CommitmentFormValues>({
    resolver: zodResolver<CommitmentFormValues>(schema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      targetDate: initialValues?.targetDate || null,
      recurrence: initialValues?.recurrence || 'none',
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

  return (
    <YStack gap="$4" width="100%">
      <ControlledInput
        name="title"
        control={untypedControl}
        label={t('form.fields.title.label', { ns: 'commitments' })}
        placeholder={t('form.fields.title.placeholder', { ns: 'commitments' })}
      />
      
      <ControlledInput
        name="description"
        control={untypedControl}
        label={t('form.fields.description.label', { ns: 'commitments' })}
        placeholder={t('form.fields.description.placeholder', { ns: 'commitments' })}
        multiline
        numberOfLines={3}
      />

      <ControlledDatePicker
        name="targetDate"
        control={untypedControl}
        label={t('form.fields.targetDate.label', { ns: 'commitments' })}
        placeholder={t('form.fields.targetDate.placeholder', { ns: 'commitments' })}
      />

      <ControlledSelect
        name="recurrence"
        control={untypedControl}
        label={t('form.fields.recurrence.label', { ns: 'commitments' })}
        placeholder={t('form.fields.recurrence.placeholder', { ns: 'commitments' })}
        options={recurrenceOptions}
      />

      <Button
        theme="active"
        size="$5"
        marginTop="$4"
        disabled={isSubmitting}
        onPress={control.handleSubmit(onSubmit)}
      >
        <Text color="white" fontWeight="bold">
          {isSubmitting ? '...' : t('form.submit', { ns: 'commitments' })}
        </Text>
      </Button>
    </YStack>
  );
}
