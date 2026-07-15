import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, Circle } from 'tamagui';
import { Card, Title, Body } from '@commitment/design-system';
import { isHabitDueOn } from '@commitment/domain';
import { useHabits } from '@/features/habits/hooks/useHabits';

/** Today's habit due/completed counts + at-risk list — real via isHabitDueOn + currentStreakDays, no fabricated history. */
export function HabitConsistencyInsight() {
  const { t } = useTranslation('common');
  const { data: habits = [] } = useHabits();

  const { dueToday, completedToday, atRisk } = useMemo(() => {
    const today = new Date();
    const due = habits.filter((h) => h.enabled && isHabitDueOn(h.recurrence, today, new Date(h.recurrenceAnchorDate)));
    return {
      dueToday: due,
      completedToday: due.filter((h) => h.completedToday),
      atRisk: due.filter((h) => !h.completedToday),
    };
  }, [habits]);

  return (
    <Card variant="elevated" gap="$3">
      <Title i18nKey="insights.habitConsistency.title" fontSize="$5" />
      <XStack gap="$4">
        <YStack alignItems="center" flex={1}>
          <Title fontSize="$7" fontWeight="bold" color="$success">{completedToday.length}</Title>
          <Body tone="secondary" fontSize="$2" textAlign="center">{t('insights.habitConsistency.completed')}</Body>
        </YStack>
        <YStack alignItems="center" flex={1}>
          <Title fontSize="$7" fontWeight="bold">{dueToday.length}</Title>
          <Body tone="secondary" fontSize="$2" textAlign="center">{t('insights.habitConsistency.dueToday')}</Body>
        </YStack>
      </XStack>
      {atRisk.length > 0 && (
        <YStack gap="$2">
          {atRisk.map((h) => (
            <XStack key={h.id} gap="$2" alignItems="center">
              <Circle size={6} backgroundColor="$warning" />
              <Body tone="secondary" fontSize="$2" numberOfLines={1} ellipsizeMode="tail">{h.title}</Body>
            </XStack>
          ))}
        </YStack>
      )}
    </Card>
  );
}
