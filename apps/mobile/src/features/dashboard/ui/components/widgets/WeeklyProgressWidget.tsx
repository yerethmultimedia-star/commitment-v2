import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';

export interface WeeklyProgressWidgetProps {
  completed: number;
  target: number;
}

export const WeeklyProgressWidget = React.memo(function WeeklyProgressWidget({ completed, target }: WeeklyProgressWidgetProps) {
  const { t } = useTranslation();

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
    <Card variant="elevated" interactive={false}>
      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="600" color="$contentPrimary">
          {t('dashboard.weekProgress', 'Progreso Semanal')}
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
          
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
            {completed} / {target}
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
});
