import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { TrendingUp } from '@tamagui/lucide-icons';
import { Card } from '@commitment/design-system';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

// AR-036/D-036.1 — renamed from CurrentStreakWidget. Daily continuity is no
// longer presented as an independent objective ("keep the flame lit") — it's
// framed as a dimension of progress, same underlying weekly-completions
// signal as before, no logic change.
export const DailyConsistencyWidget = React.memo(function DailyConsistencyWidget() {
  const { t } = useTranslation();
  const { data: dashboard } = useDashboardQuery();

  const consistencyInfo = useMemo(() => {
    const completed = dashboard?.metrics?.completedThisWeek ?? 0;
    const days = completed > 0 ? Math.min(7, completed * 2 - 1) : 0;

    return {
      days,
      active: days > 0,
    };
  }, [dashboard]);

  return (
    <Card variant="elevated" padding={0} overflow="hidden">
      <YStack
        padding="$4"
        backgroundColor="$accent"
        borderRadius="$4"
      >
        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="600" color="$contentOnAccent">
            {t('dashboard.widgets.dailyConsistency.title', { defaultValue: 'Daily Consistency' })}
          </Text>

          <XStack alignItems="center" gap="$3">
            <TrendingUp size={32} color="$contentOnAccent" />
            <YStack>
              <Text fontSize="$8" fontWeight="bold" color="$contentOnAccent">
                {t('dashboard.widgets.dailyConsistency.count', { count: consistencyInfo.days, defaultValue: '{{count}} Days' })}
              </Text>
              <Text fontSize="$3" color="$contentOnAccent" opacity={0.85}>
                {consistencyInfo.active
                  ? t('dashboard.widgets.dailyConsistency.activeMsg', { defaultValue: "You're building consistency!" })
                  : t('dashboard.widgets.dailyConsistency.inactiveMsg', { defaultValue: 'Complete a task today to get started!' })}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
});
