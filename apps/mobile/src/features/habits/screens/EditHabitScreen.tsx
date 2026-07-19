import { useTranslation } from 'react-i18next';
import { YStack, ScrollView } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Title, Button, LoadingState, ErrorState,
} from '@commitment/design-system';
import { useHabit, useEditHabit, useRelinkHabitGoal } from '../hooks/useHabits';
import { HabitForm } from '../components/forms/HabitForm';
import { HabitFormValues } from '../models/habit.schema';

/**
 * Habit field editing only — Product Decision "Capture vs Authoring"
 * (2026-07-19). Enable/Disable, Postpone, and Archive relocated to
 * HabitDetailScreen.tsx (they're "Manage" actions on an existing habit, not
 * field edits — see that screen's own doc comment). Reached only via an
 * explicit "Edit" action from Detail now, never as the default result of
 * tapping a habit in a list.
 *
 * Goal linkage (2026-07-15 product decision — Goal is now optional for
 * Habits) lives inside `HabitForm`'s own picker, submitted together with
 * the rest of the form — not a separate read-only card, that would just
 * show the same information twice with only one copy being editable.
 * Changing it fires a dedicated `relinkGoal` mutation alongside the
 * generic edit, mirroring the backend's own separate `PATCH .../goal`
 * command (a relationship change, not a field edit).
 */
export function EditHabitScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: habit, isLoading, isError, refetch } = useHabit(id);
  const { mutateAsync, isPending } = useEditHabit();
  const relinkGoal = useRelinkHabitGoal();

  if (isLoading) return <LoadingState title={{ i18nKey: 'habits.workspace.loading' }} />;
  if (isError || !habit) {
    return (
      <ErrorState
        title={{ i18nKey: 'habits.workspace.error.title' }}
        primaryAction={<Button variant="primary" onPress={refetch} i18nKey="habits.workspace.error.retry" />}
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
    // Sequential, not Promise.all — both mutations do a read-modify-write
    // against the same demo-mode record (findOrThrow then replace, no
    // locking). Firing them concurrently caused a real lost-update bug,
    // found live: each captured its own "before" snapshot near-simultaneously,
    // so whichever `replace()` landed second overwrote the other's change
    // with stale data. The real backend (event-sourced, one command per
    // aggregate write) doesn't have this hazard, but the demo repository
    // does, and demo mode is what most verification runs against.
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
    if (values.goalId !== (habit.goalId ?? null)) {
      await relinkGoal.mutateAsync({ id, goalId: values.goalId });
    }
    router.back();
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title: t('habits.form.editTitle') }} />
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$5" paddingBottom="$10">
          <Title fontSize="$7" fontWeight="bold">{habit.title}</Title>
          <HabitForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={isPending} />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
