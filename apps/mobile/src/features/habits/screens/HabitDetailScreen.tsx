import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, ScrollView, Switch, Circle } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronRight, Clock, Archive as ArchiveIcon, Flame, Target } from '@tamagui/lucide-icons';
import {
  Title, Body, Button, Card, ConfirmationDialog, LoadingState, ErrorState, toPlatformAccessibilityProps,
} from '@commitment/design-system';
import { formatTime } from '@commitment/localization';
import { useHabit, useSetHabitEnabled, usePostponeHabit, useArchiveHabit } from '../hooks/useHabits';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { formatRecurrence } from '../utils/format-recurrence';
import { PostponeSheet } from '../components/PostponeSheet';

/**
 * Habit's read-only Detail — Product Decision "Capture vs Authoring"
 * (2026-07-19): List -> Detail -> Edit, Edit always an explicit action.
 * Replaces the old behavior where tapping a habit in any list went straight
 * to `/habits/[id]/edit` (a live, always-editable form) — HabitCard.tsx's
 * own doc comment already named this as the exact spot needing this fix.
 *
 * Enable/Disable, Postpone, and Archive relocate here from EditHabitScreen —
 * they're "Manage" actions on an existing habit (per the same Product
 * Decision's Capture/Author/Manage framing), not field edits, so they don't
 * belong behind the explicit Edit action. EditHabitScreen keeps only
 * HabitForm (the actual field-editing surface) after this change.
 */
export function HabitDetailScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: habit, isLoading, isError, refetch } = useHabit(id);
  const { data: goals = [] } = useGoals();
  const setHabitEnabled = useSetHabitEnabled();
  const postponeHabit = usePostponeHabit();
  const archiveHabit = useArchiveHabit();
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  const linkedGoalTitle = useMemo(
    () => (habit?.goalId ? goals.find((g: any) => g.id === habit.goalId)?.title : undefined),
    [goals, habit?.goalId],
  );

  if (isLoading) return <LoadingState title={{ i18nKey: 'habits.workspace.loading' }} />;
  if (isError || !habit) {
    return (
      <ErrorState
        title={{ i18nKey: 'habits.workspace.error.title' }}
        primaryAction={<Button variant="primary" onPress={refetch} i18nKey="habits.workspace.error.retry" />}
      />
    );
  }

  const timeLabel = formatTime(new Date(2026, 0, 1, habit.reminderHour, habit.reminderMinute));
  const recurrenceLabel = formatRecurrence(t, habit.recurrence);

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen
        options={{
          title: habit.title,
          headerRight: () => (
            <Button
              variant="ghost"
              size="small"
              i18nKey="habits.detail.editAction"
              onPress={() => router.push(`/habits/${id}/edit` as any)}
            />
          ),
        }}
      />
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$5" paddingBottom="$10">
          <YStack gap="$1">
            <Title fontSize="$7" fontWeight="bold">{habit.title}</Title>
            <Body tone="secondary" fontSize="$3">{recurrenceLabel} · {timeLabel}</Body>
          </YStack>

          <XStack gap="$4">
            {habit.currentStreakDays > 0 && (
              <XStack gap="$1" alignItems="center">
                <Flame size={16} color="$warning" />
                <Body fontWeight="700" color="$warning">
                  {t('habits.detail.streakDays', { count: habit.currentStreakDays })}
                </Body>
              </XStack>
            )}
            {linkedGoalTitle && (
              <XStack gap="$1" alignItems="center" flex={1} minWidth={0}>
                <Target size={16} color="$contentSecondary" />
                <Body tone="secondary" numberOfLines={1}>{linkedGoalTitle}</Body>
              </XStack>
            )}
          </XStack>

          {/* Enable/disable is a Manage action, not a field edit — a tap on
              the list must never risk silently pausing a habit, and now
              neither does landing on Detail (no live form here). */}
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
              <Switch.Thumb backgroundColor={habit.enabled ? '$contentOnAccent' : '$contentPrimary'} transition="cardEntrance" />
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

          <Button
            variant="secondary"
            fullWidth
            i18nKey="habits.detail.editAction"
            onPress={() => router.push(`/habits/${id}/edit` as any)}
          />
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
