import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, ScrollView, Switch } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronRight, Clock, Archive as ArchiveIcon } from '@tamagui/lucide-icons';
import {
  Title, Body, Button, Card, ConfirmationDialog, LoadingState, ErrorState, toPlatformAccessibilityProps,
} from '@commitment/design-system';
import { useHabit, useEditHabit, useSetHabitEnabled, usePostponeHabit, useArchiveHabit, useRelinkHabitGoal } from '../hooks/useHabits';
import { HabitForm } from '../components/forms/HabitForm';
import { HabitFormValues } from '../models/habit.schema';
import { PostponeSheet } from '../components/PostponeSheet';

/**
 * A habit's detail — iteration 2 of the Habits UX pass (2026-07-15): the
 * list is execution-only now (see `HabitCard`), so everything secondary
 * moved here — Postpone and Archive, both already-existing mutations just
 * relocated from list-row icon buttons. "Duplicar"/"Eliminar" from the
 * brief's own example menu were deliberately left out — no such mutation
 * exists yet, and adding one would be new functionality, not a UI move.
 *
 * Goal linkage (2026-07-15 product decision — Goal is now optional for
 * Habits) lives inside `HabitForm`'s own picker, submitted together with
 * the rest of the form — not a separate read-only card, that would just
 * show the same information twice with only one copy being editable.
 * Changing it fires a dedicated `relinkGoal` mutation alongside the
 * generic edit, mirroring the backend's own separate `PATCH .../goal`
 * command (a relationship change, not a field edit — same reasoning as
 * `postpone()`/`archive()` being their own domain methods).
 */
export function EditHabitScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: habit, isLoading, isError, refetch } = useHabit(id);
  const { mutateAsync, isPending } = useEditHabit();
  const setHabitEnabled = useSetHabitEnabled();
  const postponeHabit = usePostponeHabit();
  const archiveHabit = useArchiveHabit();
  const relinkGoal = useRelinkHabitGoal();
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

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
              {...toPlatformAccessibilityProps({
                accessibilityLabel: t(habit.enabled ? 'habits.disableA11y' : 'habits.enableA11y', { title: habit.title }),
              })}
            >
              <Switch.Thumb backgroundColor="#FFFFFF" {...{ animation: 'bouncy' } as any} />
            </Switch>
          </XStack>

          <Card variant="elevated" padding={0} overflow="hidden">
            <XStack
              onPress={() => setPostponeOpen(true)}
              paddingHorizontal="$4"
              paddingVertical="$3"
              justifyContent="space-between"
              alignItems="center"
              pressStyle={{ opacity: 0.7 }}
              {...toPlatformAccessibilityProps({ accessibilityRole: 'button' })}
            >
              <XStack gap="$3" alignItems="center">
                <Clock size={18} color="$contentSecondary" />
                <Body fontSize="$4">{t('habits.detail.postpone')}</Body>
              </XStack>
              <ChevronRight size={18} color="$contentTertiary" />
            </XStack>
            <XStack
              onPress={() => setConfirmingArchive(true)}
              paddingHorizontal="$4"
              paddingVertical="$3"
              justifyContent="space-between"
              alignItems="center"
              borderTopWidth={1}
              borderTopColor="$divider"
              pressStyle={{ opacity: 0.7 }}
              {...toPlatformAccessibilityProps({ accessibilityRole: 'button' })}
            >
              <XStack gap="$3" alignItems="center">
                <ArchiveIcon size={18} color="$danger" />
                <Body fontSize="$4" color="$danger">{t('habits.detail.archive')}</Body>
              </XStack>
              <ChevronRight size={18} color="$contentTertiary" />
            </XStack>
          </Card>

          <HabitForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={isPending} />
        </YStack>
      </ScrollView>

      <PostponeSheet
        open={postponeOpen}
        onOpenChange={setPostponeOpen}
        onConfirm={(minutes) => postponeHabit.mutate({ id, minutes })}
      />

      <ConfirmationDialog
        open={confirmingArchive}
        onOpenChange={setConfirmingArchive}
        titleI18nKey="habits.detail.confirmArchive.title"
        titleI18nParams={{ title: habit.title }}
        descriptionI18nKey="habits.detail.confirmArchive.description"
        descriptionI18nParams={{ title: habit.title }}
        confirmI18nKey="habits.detail.archive"
        cancelI18nKey="cancel"
        destructive
        onConfirm={() => {
          setConfirmingArchive(false);
          archiveHabit.mutate(id, { onSuccess: () => router.back() });
        }}
      />
    </YStack>
  );
}
