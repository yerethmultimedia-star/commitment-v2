import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack, Circle } from 'tamagui';
import { CheckCircle2, Clock, Pencil } from '@tamagui/lucide-icons';
import { Card, Body, IconButton } from '@commitment/design-system';
import { useHabits, useToggleHabit, usePostponeHabit } from '@/features/habits/hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { formatRecurrence } from '@/features/habits/utils/format-recurrence';
import { formatTime } from '@commitment/localization';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { PostponeSheet } from '@/features/habits/components/PostponeSheet';
import { useTranslation } from 'react-i18next';

/** "Hábitos" — every Habit across every Goal, flat. Same useHabits data the Today widget and Goal Workspace already read.
 *  Enable/disable is deliberately NOT here — it lives in the edit form only, so a card tap never risks silently pausing a habit. */
export function HabitsTab() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: habits = [], isLoading } = useHabits();
  const { data: goals = [] } = useGoals();
  const toggleHabit = useToggleHabit();
  const postponeHabit = usePostponeHabit();
  const [postponingId, setPostponingId] = useState<string | null>(null);

  const goalTitleById = useMemo(() => new Map(goals.map((g: any) => [g.id, g.title])), [goals]);

  if (isLoading) {
    return <Body i18nKey="goals.list.loading" tone="secondary" />;
  }

  if (habits.length === 0) {
    return <EmptyState title={t('goals.habitsTab.empty.title')} description={t('goals.habitsTab.empty.description')} />;
  }

  return (
    <YStack gap="$3">
      {habits.map((h) => (
        <Card key={h.id} variant="elevated" opacity={h.enabled ? 1 : 0.55}>
          <XStack gap="$3" alignItems="center">
            {/* This row (checkbox + title) is its own tap target, separate
                from the enable/disable switch below, so the two actions
                don't fight over the same touch. */}
            <XStack
              flex={1}
              gap="$3"
              alignItems="center"
              onPress={h.enabled ? () => toggleHabit.mutate({ id: h.id, completedToday: h.completedToday }) : undefined}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: h.completedToday, disabled: !h.enabled }}
              accessibilityLabel={h.title}
            >
              <Circle
                size={22} height={22} borderRadius={11} borderWidth={2}
                borderColor={h.completedToday ? '$success' : '$divider'}
                backgroundColor={h.completedToday ? '$success' : 'transparent'}
                justifyContent="center" alignItems="center"
              >
                {h.completedToday && <CheckCircle2 size={14} color="$contentOnSemantic" />}
              </Circle>
              <YStack flex={1}>
                <Body fontWeight="600" numberOfLines={1} ellipsizeMode="tail" textDecorationLine={h.completedToday ? 'line-through' : 'none'}>{h.title}</Body>
                <XStack gap="$2" alignItems="center">
                  {h.goalId && goalTitleById.has(h.goalId) && (
                    <>
                      <Body tone="secondary" fontSize="$2" numberOfLines={1} ellipsizeMode="tail">{goalTitleById.get(h.goalId)}</Body>
                      <Circle size={3} backgroundColor="$divider" />
                    </>
                  )}
                  <Body tone="secondary" fontSize="$2">{formatRecurrence(t, h.recurrence)}</Body>
                  <Circle size={3} backgroundColor="$divider" />
                  <Body tone="secondary" fontSize="$2">{formatTime(new Date(2026, 0, 1, h.reminderHour, h.reminderMinute))}</Body>
                </XStack>
              </YStack>
              {h.currentStreakDays > 0 && (
                <Body tone="secondary" fontSize="$2">{t('goals.workspace.stats.days', { count: h.currentStreakDays })}</Body>
              )}
            </XStack>
            <IconButton
              iconToken={<Clock size={16} />}
              tooltipI18nKey="habits.postpone.title"
              accessibilityHintI18nKey="habits.postpone.title"
              onPress={() => setPostponingId(h.id)}
            />
            <IconButton
              iconToken={<Pencil size={16} />}
              tooltipI18nKey="habits.form.editTitle"
              accessibilityHintI18nKey="habits.form.editTitle"
              onPress={() => router.push(`/habits/${h.id}/edit` as any)}
            />
          </XStack>
        </Card>
      ))}
      <PostponeSheet
        open={postponingId !== null}
        onOpenChange={(open) => !open && setPostponingId(null)}
        onConfirm={(minutes) => {
          if (postponingId) postponeHabit.mutate({ id: postponingId, minutes });
        }}
      />
    </YStack>
  );
}
