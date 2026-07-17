import React from 'react';
import { Card, toPlatformAccessibilityProps } from '@commitment/design-system';
import { Text, YStack } from 'tamagui';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';
import { useTranslation } from 'react-i18next';

export const CompletionRateWidget = React.memo(function CompletionRateWidget() {
  const { t } = useTranslation('common');
  const { data } = useDashboardQuery();

  const completionRate = data?.metrics?.completionRate ?? 0;

  return (
    <Card variant="elevated">
      <YStack gap="$1">
        <Text
          fontSize="$4"
          fontWeight="600"
          color="$contentPrimary"
          {...toPlatformAccessibilityProps({ accessibilityRole: 'header' })}
        >
          {t('dashboard.widgets.completionRate.title')}
        </Text>
        <Text fontSize="$8" fontWeight="bold" color="$success">
          {completionRate}%
        </Text>
        <Text color="$contentSecondary" fontSize="$2">
          {t('dashboard.widgets.completionRate.thisWeek')}
        </Text>
      </YStack>
    </Card>
  );
});
