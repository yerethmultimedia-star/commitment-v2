import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

export const CurrentStreakWidget = React.memo(function CurrentStreakWidget() {
  const { t } = useTranslation();
  const { data: dashboard } = useDashboardQuery();

  const streakInfo = useMemo(() => {
    // Simple logic: streak is calculated based on completed tasks this week
    const completed = dashboard?.metrics?.completedThisWeek ?? 0;
    const baseStreak = completed > 0 ? Math.min(7, completed * 2 - 1) : 0;
    
    return {
      streak: baseStreak,
      active: baseStreak > 0,
    };
  }, [dashboard]);

  return (
    <Card variant="elevated" padding={0} overflow="hidden">
      <YStack 
        padding="$4" 
        backgroundColor="$red9" 
        borderRadius="$4"
      >
        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="600" color="white">
            {t('dashboard.widgets.currentStreak.title', { defaultValue: 'Daily Streak' })}
          </Text>

          <XStack alignItems="center" gap="$3">
            <Text fontSize="$9">🔥</Text>
            <YStack>
              <Text fontSize="$8" fontWeight="bold" color="white">
                {t('dashboard.widgets.currentStreak.count', { count: streakInfo.streak, defaultValue: '{{count}} Days' })}
              </Text>
              <Text fontSize="$3" color="rgba(255, 255, 255, 0.9)">
                {streakInfo.active 
                  ? t('dashboard.widgets.currentStreak.activeMsg', { defaultValue: 'Keep the flame burning!' }) 
                  : t('dashboard.widgets.currentStreak.inactiveMsg', { defaultValue: 'Complete a task today to start a streak!' })}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
});
