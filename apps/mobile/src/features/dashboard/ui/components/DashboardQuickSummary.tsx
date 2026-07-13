/**
 * DashboardQuickSummary
 *
 * Compact summary row displayed below the hero card.
 * Shows: active commitments · pending tasks · streak days.
 *
 * Purely presentational — receives QuickSummaryDescriptor as props.
 */

import React from 'react';
import { XStack, YStack } from 'tamagui';
import { Body, Caption, Title } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { QuickSummaryDescriptor } from '../../engine/layout/DashboardLayoutDescriptor';

export interface DashboardQuickSummaryProps {
  summary: QuickSummaryDescriptor;
}

interface SummaryItemProps {
  value: number;
  labelKey: string;
  icon: string;
}

const SummaryItem = React.memo(function SummaryItem({
  value,
  labelKey,
  icon,
}: SummaryItemProps) {
  const { t } = useTranslation('common');
  return (
    <YStack alignItems="center" flex={1} gap="$1">
      <Body fontSize="$5">{icon}</Body>
      <Title fontSize="$5" fontWeight="bold">
        {value}
      </Title>
      <Caption tone="secondary" textAlign="center" numberOfLines={1}>
        {t(labelKey)}
      </Caption>
    </YStack>
  );
});

export const DashboardQuickSummary = React.memo(function DashboardQuickSummary({
  summary,
}: DashboardQuickSummaryProps) {
  return (
    <XStack
      backgroundColor="$surfaceSecondary"
      borderRadius="$3"
      padding="$3"
      justifyContent="space-around"
      accessibilityRole="summary"
    >
      <SummaryItem
        value={summary.activeCommitmentsCount}
        labelKey="dashboard.summary.activeCommitments"
        icon="🎯"
      />
      <SummaryItem
        value={summary.pendingTasksCount}
        labelKey="dashboard.summary.pendingTasks"
        icon="✅"
      />
      <SummaryItem
        value={summary.currentStreakDays}
        labelKey="dashboard.summary.streak"
        icon="🔥"
      />
    </XStack>
  );
});
