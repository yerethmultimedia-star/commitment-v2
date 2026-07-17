import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';
import { Card, Title, Body } from '@commitment/design-system';
import { useHabits } from '@/features/habits/hooks/useHabits';

/**
 * Streak consistency across ALL enabled habits — real via currentStreakDays,
 * no fabricated per-day history (the domain model doesn't track one).
 *
 * Deliberately NOT "today's due/completed habits" (the previous version of
 * this card) — that's Today's job ("¿qué debo hacer hoy?"); Insights answers
 * "¿cómo voy en el tiempo?". Showing the same today-snapshot in both screens
 * made them compete instead of complement each other (found 2026-07-16,
 * confirmed by explicit product decision to replace, not just relabel).
 */
export function HabitConsistencyInsight() {
  const { t } = useTranslation('common');
  const { data: habits = [] } = useHabits();

  const { averageStreak, activeStreakCount, totalCount } = useMemo(() => {
    const enabled = habits.filter((h) => h.enabled);
    const total = enabled.length;
    const active = enabled.filter((h) => h.currentStreakDays > 0).length;
    const average = total > 0
      ? Math.round(enabled.reduce((sum, h) => sum + h.currentStreakDays, 0) / total)
      : 0;
    return { averageStreak: average, activeStreakCount: active, totalCount: total };
  }, [habits]);

  return (
    <Card variant="elevated" gap="$3">
      <Title i18nKey="insights.habitConsistency.title" fontSize="$5" />
      <XStack gap="$4">
        <YStack alignItems="center" flex={1}>
          <Title fontSize="$7" fontWeight="bold" color="$success">{averageStreak}</Title>
          <Body tone="secondary" fontSize="$2" textAlign="center">{t('insights.habitConsistency.averageStreak')}</Body>
        </YStack>
        <YStack alignItems="center" flex={1}>
          <Title fontSize="$7" fontWeight="bold">{t('insights.habitConsistency.fraction', { count: activeStreakCount, total: totalCount })}</Title>
          <Body tone="secondary" fontSize="$2" textAlign="center">{t('insights.habitConsistency.activeStreaks')}</Body>
        </YStack>
      </XStack>
    </Card>
  );
}
