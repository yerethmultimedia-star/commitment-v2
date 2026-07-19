import React from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { Body, Title } from '@commitment/design-system';
import { FocusDayBar } from '../../engine/focus-detail';
import { useCountUp } from '../../hooks/useCountUp';

export interface FocusStatsSummaryProps {
  averageMinutes: number;
  bestDay: FocusDayBar | null;
  worstDay: FocusDayBar | null;
}

/**
 * Replaces the old two-Card Best/Worst layout (Sprint de Estabilización,
 * Fase 2.5) — condensed into one compact section so the bar chart above
 * stays the screen's dominant element, not competing for space with two
 * large Cards. Average gets a small count-up (useCountUp) since it's the
 * one number worth a moment of motion; Best/Worst are plain rows.
 */
export function FocusStatsSummary({ averageMinutes, bestDay, worstDay }: FocusStatsSummaryProps) {
  const { t } = useTranslation('common');
  const animatedAverage = useCountUp(averageMinutes);

  return (
    <YStack gap="$3">
      <YStack gap="$1">
        <Body tone="secondary" fontSize="$2">{t('insights.focus.average')}</Body>
        <Title fontSize="$7" fontWeight="bold">
          {t('insights.focus.minutesPerDay', { count: animatedAverage })}
        </Title>
      </YStack>

      {bestDay && worstDay && (
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Body tone="secondary" fontSize="$3">{t('insights.focus.bestDay')}</Body>
            <Body fontWeight="600">{`${bestDay.weekdayLabel} • ${t('insights.focus.minutesLabel', { count: bestDay.focusMinutes })}`}</Body>
          </XStack>
          <XStack justifyContent="space-between" alignItems="center">
            <Body tone="secondary" fontSize="$3">{t('insights.focus.worstDay')}</Body>
            <Body fontWeight="600">{`${worstDay.weekdayLabel} • ${t('insights.focus.minutesLabel', { count: worstDay.focusMinutes })}`}</Body>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
