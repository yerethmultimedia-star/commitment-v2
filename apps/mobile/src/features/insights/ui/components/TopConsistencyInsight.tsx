import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, Circle } from 'tamagui';
import { TrendingUp } from '@tamagui/lucide-icons';
import { Card, Title, Body } from '@commitment/design-system';
import { useHabits } from '@/features/habits/hooks/useHabits';

// AR-036/D-036.1 — renamed from StreakHighlightInsight. Same underlying data
// (the real best current streak across enabled habits — not a hardcoded 0
// like DashboardContext.streak still is), reframed as consistency rather
// than a "streak," and without the flame icon.
export function TopConsistencyInsight() {
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
      <Title i18nKey="insights.topConsistency.title" fontSize="$5" />
      <XStack alignItems="center" gap="$3" padding="$2">
        <Circle size={48} backgroundColor="$accent" justifyContent="center" alignItems="center">
          <TrendingUp size={24} color="$contentOnAccent" />
        </Circle>
        <YStack flex={1}>
          <Title fontSize="$6" fontWeight="bold">
            {t('insights.topConsistency.days', { count: best.currentStreakDays })}
          </Title>
          <Body tone="secondary" numberOfLines={1} ellipsizeMode="tail">{best.title}</Body>
        </YStack>
      </XStack>
    </Card>
  );
}
