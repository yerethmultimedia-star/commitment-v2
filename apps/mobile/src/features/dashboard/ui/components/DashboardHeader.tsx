/**
 * DashboardHeader
 *
 * Greeting row + notification bell at the top of the Dashboard. No avatar
 * here — the real user identity (name/avatar/plan) now lives on the Profile
 * tab; this placeholder "ME" circle predated that and was redundant.
 * Receives commitmentsCount from the parent (DashboardContent),
 * which derives it from the DashboardLayoutDescriptor.
 *
 * No direct store reads here.
 */

import React, { useMemo } from 'react';
import { YStack, XStack } from 'tamagui';
import { Title, Body, IconButton } from '@commitment/design-system';
import { Bell } from '@tamagui/lucide-icons';
import { formatLongDate } from '@commitment/localization';
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

    const dateStr = formatLongDate(new Date());
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

        {/* No unread badge yet — no real notification data source exists in
            this app today; showing a fake count would misrepresent state. */}
        <XStack marginLeft="$3">
          <IconButton
            iconToken={<Bell size={22} color="$contentSecondary" />}
            tooltipI18nKey="dashboard.header.notifications"
          />
        </XStack>
      </XStack>

      {/* Active commitment count */}
      <Body tone="secondary" fontSize="$4">
        {activeCountText}
      </Body>
    </YStack>
  );
});
