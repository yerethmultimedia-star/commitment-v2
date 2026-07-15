import React from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { Card, Title, Body } from '@commitment/design-system';
import { Sparkline } from './Sparkline';

export interface StatCardProps {
  titleKey: string;
  value: number;
  valueFormatter?: (value: number) => string;
  delta: number;
  sparklinePoints: readonly number[];
  onPress?: () => void;
  testID?: string;
}

export function StatCard({ titleKey, value, valueFormatter, delta, sparklinePoints, onPress, testID }: StatCardProps) {
  const { t } = useTranslation('common');
  const formattedValue = valueFormatter ? valueFormatter(value) : String(value);
  const deltaColor = delta > 0 ? '$success' : delta < 0 ? '$danger' : '$contentSecondary';
  const signPrefix = delta > 0 ? '+' : '';

  return (
    <Card
      variant="elevated"
      clickable={!!onPress}
      onPress={onPress}
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${t(titleKey)}: ${formattedValue}` : undefined}
      gap="$2"
    >
      <Body tone="secondary" fontSize="$2" i18nKey={titleKey} />
      <XStack alignItems="flex-end" justifyContent="space-between" gap="$2">
        <YStack gap="$1">
          <Title fontSize="$7" fontWeight="bold">{formattedValue}</Title>
          <Body fontSize="$2" color={deltaColor as any}>
            {t('insights.overview.deltaVsLastWeek', { sign: signPrefix, count: delta })}
          </Body>
        </YStack>
        <Sparkline points={sparklinePoints} />
      </XStack>
    </Card>
  );
}
