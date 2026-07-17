import { useForm, useController, FieldValues } from 'react-hook-form';
import { zodResolver } from '@/shared/forms/zodResolver';
import { YStack, Text, Input } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Button, toPlatformAccessibilityProps } from '@commitment/design-system';
import { createHabitSchema, HabitFormValues, HABIT_RECURRENCE_TYPES, NO_GOAL_VALUE } from '../../models/habit.schema';
import { ControlledInput } from '@/shared/forms/ControlledInput';
import { ControlledSelect } from '@/shared/forms/ControlledSelect';
import { ControlledDatePicker } from '@/shared/forms/ControlledDatePicker';
import { WeekdayPicker } from './WeekdayPicker';
import { useGoals } from '@/features/goals/hooks/useGoals';

interface Props {
  initialValues?: Partial<HabitFormValues>;
  onSubmit: (values: HabitFormValues) => Promise<void>;
  isSubmitting?: boolean;
  /** Override the submit button's i18n key (defaults to 'common:habits.form.submit'). */
  submitLabelI18nKey?: string;
}

const RECURRENCE_OPTIONS = HABIT_RECURRENCE_TYPES.map((value) => ({ value, labelKey: `habits.recurrenceOptions.${value}` }));
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: String(i), labelKey: `habits.months.${i}` }));

function DayOfMonthField({ control }: { control: any }) {
  const { t } = useTranslation('common');
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name: 'dayOfMonth', control });

  return (
    <YStack gap="$2" width="100%">
      <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">
        {t('habits.form.fields.dayOfMonth.label')}
      </Text>
      <Input
        value={value ? String(value) : ''}
        onChangeText={(text) => {
          const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
          onChange(Number.isNaN(parsed) ? undefined : Math.min(31, Math.max(1, parsed)));
        }}
        keyboardType="number-pad"
        placeholder="1-31"
        borderColor={error ? '$danger' : '$divider'}
        {...toPlatformAccessibilityProps({ accessibilityLabel: t('habits.form.fields.dayOfMonth.label') })}
      />
      {error && <Text color="$danger" fontSize="$2">{error.message as string}</Text>}
    </YStack>
  );
}

export function HabitForm({ initialValues, onSubmit, isSubmitting, submitLabelI18nKey }: Props) {
  const { t } = useTranslation('common');
  const schema = createHabitSchema(t);
  const { data: goals = [] } = useGoals();

  const control = useForm<HabitFormValues>({
    resolver: zodResolver<HabitFormValues>(schema),
    defaultValues: {
      title: initialValues?.title || '',
      recurrenceType: initialValues?.recurrenceType || 'Daily',
      daysOfWeek: initialValues?.daysOfWeek || [],
      dayOfMonth: initialValues?.dayOfMonth ?? undefined,
      // ControlledSelect (Tamagui Select) matches string item values — pre-fill as a string even though the schema's output type is number (coerced back on submit).
      month: (initialValues?.month !== undefined && initialValues?.month !== null ? String(initialValues.month) : undefined) as any,
      reminderTime: initialValues?.reminderTime || new Date(2026, 0, 1, 9, 0),
      // "Ninguno" (NO_GOAL_VALUE) is the default — Goal linkage is opt-in, not assumed (2026-07-15 product decision).
      goalId: initialValues?.goalId ?? NO_GOAL_VALUE,
    },
  });

  const untypedControl = control.control as unknown as import('react-hook-form').Control<FieldValues>;
  const recurrenceType = control.watch('recurrenceType');

  const goalOptions = [
    { value: NO_GOAL_VALUE, labelKey: 'habits.form.fields.goal.none' },
    ...goals.map((g: any) => ({ value: g.id, label: g.title })),
  ];

  return (
    <YStack gap="$4" width="100%">
      <ControlledInput
        name="title"
        control={untypedControl}
        label={t('habits.form.fields.title.label')}
        placeholder={t('habits.form.fields.title.placeholder')}
      />

      <ControlledSelect
        name="goalId"
        control={untypedControl}
        ns="common"
        label={t('habits.form.fields.goal.label')}
        options={goalOptions}
      />

      <ControlledSelect
        name="recurrenceType"
        control={untypedControl}
        ns="common"
        label={t('habits.form.fields.recurrenceType.label')}
        options={RECURRENCE_OPTIONS}
      />

      {(recurrenceType === 'Weekly' || recurrenceType === 'Biweekly') && (
        <WeekdayPicker name="daysOfWeek" control={untypedControl} label={t('habits.form.fields.daysOfWeek.label')} />
      )}

      {(recurrenceType === 'Monthly' || recurrenceType === 'Yearly') && (
        <DayOfMonthField control={untypedControl} />
      )}

      {recurrenceType === 'Yearly' && (
        <ControlledSelect
          name="month"
          control={untypedControl}
          ns="common"
          label={t('habits.form.fields.month.label')}
          options={MONTH_OPTIONS}
        />
      )}

      <ControlledDatePicker
        name="reminderTime"
        control={untypedControl}
        mode="time"
        label={t('habits.form.fields.reminderTime.label')}
      />

      <Button
        variant="primary"
        size="large"
        loading={isSubmitting}
        onPress={control.handleSubmit(onSubmit)}
        i18nKey={submitLabelI18nKey ?? 'common:habits.form.submit'}
      />
    </YStack>
  );
}
