import { useRouter } from 'expo-router';
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
        <HabitForm onSubmit={handleSubmit} isSubmitting={isPending} submitLabel={t('habits.form.createSubmit')} />
      </YStack>
    </ScrollView>
  );
}
