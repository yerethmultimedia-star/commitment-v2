import React from 'react';
import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';
import { Card, Title, Body } from '@commitment/design-system';
import { FocusDayBar } from '../../engine/focus-detail';

export interface BestWorstDayCardProps {
  label: string;
  day: FocusDayBar;
}

export function BestWorstDayCard({ label, day }: BestWorstDayCardProps) {
  const { t } = useTranslation('common');
  return (
    <Card variant="outlined" flex={1} gap="$1">
      <YStack gap="$1">
        <Body tone="secondary" fontSize="$2">{label}</Body>
        <Title fontSize="$5" fontWeight="bold">{day.weekdayLabel}</Title>
        <Body tone="secondary" fontSize="$2">{t('insights.focus.minutesLabel', { count: day.focusMinutes })}</Body>
      </YStack>
    </Card>
  );
}
