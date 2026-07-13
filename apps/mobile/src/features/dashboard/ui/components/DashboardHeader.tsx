/**
 * DashboardHeader
 *
 * Greeting row + avatar at the top of the Dashboard.
 * Receives commitmentsCount from the parent (DashboardContent),
 * which derives it from the DashboardLayoutDescriptor.
 *
 * No direct store reads here.
 */

import React, { useMemo } from 'react';
import { YStack, XStack, Circle } from 'tamagui';
import { Title, Body } from '@commitment/design-system';
import { formatDate } from '@commitment/localization';
import { useTranslation } from 'react-i18next';

export interface DashboardHeaderProps {
  commitmentsCount: number;
}

export const DashboardHeader = React.memo(function DashboardHeader({
  commitmentsCount,
}: DashboardHeaderProps) {
  const { t } = useTranslation('common');

  const headerData = useMemo(() => {
    const hour = new Date().getHours();
    let greetingKey = 'dashboard.greetingMorning';

    if (hour >= 12 && hour < 20) {
      greetingKey = 'dashboard.greetingAfternoon';
    } else if (hour >= 20 || hour < 5) {
      greetingKey = 'dashboard.greetingEvening';
    }

    const dateStr = formatDate(new Date(), "EEEE, d 'de' MMMM");
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    return { greetingKey, formattedDate };
  }, []);

  const activeCountText = useMemo(() => {
    if (commitmentsCount === 0) return t('dashboard.noActiveCount');
    return t('dashboard.activeCount', { count: commitmentsCount });
  }, [commitmentsCount, t]);

  return (
    <YStack gap="$4" paddingBottom="$3">
      {/* Greeting Row */}
      <XStack justifyContent="space-between" alignItems="center">
        <YStack gap="$1" flex={1}>
          <Title
            i18nKey={headerData.greetingKey}
            fontSize="$7"
            fontWeight="bold"
            letterSpacing={-0.5}
          />
          <Body tone="secondary" fontSize="$3">
            {headerData.formattedDate}
          </Body>
        </YStack>

        {/* Avatar */}
        <Circle
          size={44}
          backgroundColor="$accent"
          borderWidth={1}
          borderColor="$borderColor"
          marginLeft="$4"
          elevation={2}
        >
          <Title fontSize="$4" fontWeight="bold" color="white">
            ME
          </Title>
        </Circle>
      </XStack>

      {/* Active commitment count */}
      <Body tone="secondary" fontSize="$4">
        {activeCountText}
      </Body>
    </YStack>
  );
});
