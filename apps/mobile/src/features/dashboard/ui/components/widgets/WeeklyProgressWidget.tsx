import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';

import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

export const WeeklyProgressWidget = React.memo(function WeeklyProgressWidget() {
  const { t } = useTranslation();
  const { data: dashboard } = useDashboardQuery();

  const completed = dashboard?.metrics.completedThisWeek ?? 0;
  const target = Math.max(completed + (dashboard?.metrics.pending ?? 0), 1);

  const progressData = useMemo(() => {
    const safeTarget = target > 0 ? target : 1;
    const percentage = Math.min(100, Math.round((completed / safeTarget) * 100));
    
    // Simple text-based bar as requested: ██████░░░░ 60%
    const totalBlocks = 10;
    const filledBlocks = Math.round((percentage / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    
    return { percentage, bar };
  }, [completed, target]);

  return (
    <Card variant="elevated">
      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="600" color="$contentPrimary" accessibilityRole="header">
          {t('dashboard.widgets.weeklyProgress.title')}
        </Text>
        
        <XStack justifyContent="space-between" alignItems="flex-end">
          <YStack>
            <Text fontSize="$6" fontWeight="bold" color="$success" letterSpacing={2}>
              {progressData.bar}
            </Text>
            <Text fontSize="$3" color="$contentSecondary" marginTop="$1">
              {progressData.percentage}%
            </Text>
          </YStack>
          
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary" accessibilityLabel={t('dashboard.widgets.weeklyProgress.completedVsTarget', { completed, target })}>
            {completed} / {target}
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
});
