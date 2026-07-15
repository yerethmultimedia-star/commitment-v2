import { useTranslation } from 'react-i18next';
import { YStack, XStack, ScrollView, Switch } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Title, Body } from '@commitment/design-system';
import { useHabit, useEditHabit, useSetHabitEnabled } from '../hooks/useHabits';
import { HabitForm } from '../components/forms/HabitForm';
import { HabitFormValues } from '../models/habit.schema';
import { LoadingState } from '@/shared/ui/feedback/LoadingState';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';

export function EditHabitScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: habit, isLoading, isError, refetch } = useHabit(id);
  const { mutateAsync, isPending } = useEditHabit();
  const setHabitEnabled = useSetHabitEnabled();

  if (isLoading) return <LoadingState />;
  if (isError || !habit) {
    return (
      <ErrorState
        message={t('goals.workspace.loading')}
        retryLabel={t('goals.list.error.retry')}
        onRetry={refetch}
      />
    );
  }

  const initialValues: Partial<HabitFormValues> = {
    title: habit.title,
    recurrenceType: habit.recurrence.type,
    daysOfWeek: [...habit.recurrence.daysOfWeek],
    dayOfMonth: habit.recurrence.dayOfMonth,
    month: habit.recurrence.month,
    reminderTime: new Date(2026, 0, 1, habit.reminderHour, habit.reminderMinute),
    goalId: habit.goalId,
  };

  const handleSubmit = async (values: HabitFormValues) => {
    await mutateAsync({
      id,
      payload: {
        title: values.title,
        recurrenceType: values.recurrenceType,
        daysOfWeek: values.daysOfWeek,
        dayOfMonth: values.dayOfMonth ?? undefined,
        month: values.month ?? undefined,
        reminderHour: values.reminderTime.getHours(),
        reminderMinute: values.reminderTime.getMinutes(),
      },
    });
    router.back();
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title: t('habits.form.editTitle') }} />
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$5" paddingBottom="$10">
          <Title fontSize="$7" fontWeight="bold">{habit.title}</Title>

          {/* Enable/disable lives here, not on the habit card — a card tap should never risk silently pausing a habit. */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="$surfaceRaised"
            borderRadius="$4"
            padding="$3"
          >
            <Body fontWeight="600">{t('habits.form.fields.enabled.label')}</Body>
            <Switch
              size="$3"
              checked={habit.enabled}
              onCheckedChange={(enabled) => setHabitEnabled.mutate({ id, enabled })}
              backgroundColor={habit.enabled ? '$interactive' : '$surface'}
              borderColor={habit.enabled ? '$interactive' : '$divider'}
              borderWidth={1}
              accessibilityLabel={t(habit.enabled ? 'habits.disableA11y' : 'habits.enableA11y', { title: habit.title })}
            >
              <Switch.Thumb backgroundColor="#FFFFFF" {...{ animation: 'bouncy' } as any} />
            </Switch>
          </XStack>

          <HabitForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={isPending} submitLabel={t('habits.form.submit')} />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
