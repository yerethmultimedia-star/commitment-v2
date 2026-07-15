import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, Circle } from 'tamagui';
import { Card, Title, Body } from '@commitment/design-system';
import { useHabits } from '@/features/habits/hooks/useHabits';

/** The real best current streak across enabled habits — not a hardcoded 0 like DashboardContext.streak still is. */
export function StreakHighlightInsight() {
  const { t } = useTranslation('common');
  const { data: habits = [] } = useHabits();

  const best = useMemo(() => {
    return habits
      .filter((h) => h.enabled)
      .reduce<{ title: string; currentStreakDays: number } | null>((top, h) => {
        if (!top || h.currentStreakDays > top.currentStreakDays) {
          return { title: h.title, currentStreakDays: h.currentStreakDays };
        }
        return top;
      }, null);
  }, [habits]);

  if (!best || best.currentStreakDays === 0) return null;

  return (
    <Card variant="elevated" gap="$3">
      <Title i18nKey="insights.streakHighlight.title" fontSize="$5" />
      <XStack alignItems="center" gap="$3" padding="$2">
        <Circle size={48} backgroundColor="$accent" justifyContent="center" alignItems="center">
          <Body fontSize="$6">🔥</Body>
        </Circle>
        <YStack flex={1}>
          <Title fontSize="$6" fontWeight="bold">
            {t('insights.streakHighlight.days', { count: best.currentStreakDays })}
          </Title>
          <Body tone="secondary" numberOfLines={1} ellipsizeMode="tail">{best.title}</Body>
        </YStack>
      </XStack>
    </Card>
  );
}
