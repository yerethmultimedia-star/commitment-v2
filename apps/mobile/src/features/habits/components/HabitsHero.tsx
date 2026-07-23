import React from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';
import { TrendingUp, CheckCircle2 } from '@tamagui/lucide-icons';
import { Card, Title, Body, ProgressMetric } from '@commitment/design-system';

export interface HabitsHeroProps {
  completed: number;
  total: number;
  consistencyDays: number;
}

/**
 * The "Today's Habits" summary — iteration 2 (2026-07-15), closer to
 * Activity Rings per explicit reference: the ring carries the raw "4/7"
 * count (not a percentage), and consistency/completed are two calm stat rows
 * beside it rather than one combined sentence. `ProgressMetric` has no
 * slot for custom center content (it only renders its own percentage
 * label), so the ratio is layered on top via absolute positioning from
 * this feature-local component — `ProgressMetric` itself is untouched,
 * per "no new/modified Design System components".
 *
 * AR-036/D-036.1 — renamed prop from `currentStreak`; same value
 * (`Habit.currentStreakDays`, out of scope), reframed at the presentation
 * layer only.
 */
export function HabitsHero({ completed, total, consistencyDays }: HabitsHeroProps) {
  const { t } = useTranslation('common');
  const progress = total > 0 ? completed / total : 0;

  return (
    <Card variant="elevated" padding="$5">
      <XStack gap="$5" alignItems="center">
        <YStack position="relative" alignItems="center" justifyContent="center">
          <ProgressMetric progress={progress} size="large" tone="accent" showPercentage={false} />
          <YStack position="absolute" inset={0} alignItems="center" justifyContent="center">
            <XStack alignItems="baseline" gap="$1">
              <Title fontSize="$9" fontWeight="bold">{completed}</Title>
              <Body tone="secondary" fontSize="$4">/{total}</Body>
            </XStack>
          </YStack>
        </YStack>

        <YStack height={64} width={1} backgroundColor="$divider" />

        <YStack flex={1} gap="$3">
          <XStack gap="$2" alignItems="center">
            <TrendingUp size={18} color="$success" />
            <YStack>
              <Title fontSize="$6" fontWeight="bold">{consistencyDays}</Title>
              <Body tone="secondary" fontSize="$2">{t('habits.hero.consistencyLabel')}</Body>
            </YStack>
          </XStack>
          <XStack gap="$2" alignItems="center">
            <CheckCircle2 size={18} color="$success" />
            <YStack>
              <Title fontSize="$6" fontWeight="bold">{completed}</Title>
              <Body tone="secondary" fontSize="$2">{t('habits.hero.completedLabel')}</Body>
            </YStack>
          </XStack>
        </YStack>
      </XStack>
    </Card>
  );
}
