import { useRouter, useLocalSearchParams } from 'expo-router';
import { YStack, ScrollView } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Title } from '@commitment/design-system';
import { HabitForm } from '../components/forms/HabitForm';
import { useCreateHabit } from '../hooks/useHabits';
import { HabitFormValues } from '../models/habit.schema';

export function CreateHabitScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateHabit();
  // Goal Workspace's "Agregar hábito" preloads this; the user can still change or clear it in the form — it's a starting point, not a lock.
  const { goalId: prefillGoalId } = useLocalSearchParams<{ goalId?: string }>();

  const handleSubmit = async (values: HabitFormValues) => {
    await mutateAsync({
      title: values.title,
      recurrenceType: values.recurrenceType,
      daysOfWeek: values.daysOfWeek,
      dayOfMonth: values.dayOfMonth ?? undefined,
      month: values.month ?? undefined,
      reminderHour: values.reminderTime.getHours(),
      reminderMinute: values.reminderTime.getMinutes(),
      goalId: values.goalId ?? undefined,
    });
    router.back();
  };

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$4" gap="$6" paddingBottom="$10">
        <Title fontSize="$8" fontWeight="bold">
          {t('habits.form.createTitle')}
        </Title>
        <HabitForm
          initialValues={prefillGoalId ? { goalId: prefillGoalId } : undefined}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabelI18nKey="common:habits.form.createSubmit"
        />
      </YStack>
    </ScrollView>
  );
}
