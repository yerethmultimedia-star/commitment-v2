import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';
import { formatDate } from '@commitment/localization';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

export const RecentActivityWidget = React.memo(function RecentActivityWidget() {
  const { t } = useTranslation();
  const { data: dashboard } = useDashboardQuery();

  const activities = useMemo(() => dashboard?.recentActivity ?? [], [dashboard?.recentActivity]);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 1) return t('dashboard.widgets.recentActivity.justNow', { defaultValue: 'Just now' });
      if (diffMins < 60) return t('dashboard.widgets.recentActivity.minutesAgo', { count: diffMins, defaultValue: '{{count}}m ago' });
      if (diffHours < 24) return t('dashboard.widgets.recentActivity.hoursAgo', { count: diffHours, defaultValue: '{{count}}h ago' });
      
      return formatDate(date);
    } catch (e) {
      return '';
    }
  };

  return (
    <Card variant="elevated">
      <YStack gap="$3">
        <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
          {t('dashboard.widgets.recentActivity.title', { defaultValue: 'Recent Activity' })}
        </Text>

        <YStack gap="$2">
          {activities.length === 0 ? (
            <YStack padding="$4" alignItems="center" backgroundColor="$surface" borderRadius="$3">
              <Text color="$contentSecondary" fontSize="$3">
                {t('dashboard.widgets.recentActivity.empty', { defaultValue: 'No recent activity.' })}
              </Text>
            </YStack>
          ) : (
            activities.map((activity) => (
              <XStack
                key={activity.id}
                backgroundColor="$surface"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$divider"
                alignItems="center"
                justifyContent="space-between"
              >
                <XStack alignItems="center" flex={1} marginRight="$2">
                  <Text fontSize="$4" marginRight="$2">✅</Text>
                  <Text color="$contentPrimary" fontSize="$4" numberOfLines={1} flex={1}>
                    {activity.title}
                  </Text>
                </XStack>
                <Text color="$contentTertiary" fontSize="$2">
                  {activity.completedAt ? formatRelativeTime(activity.completedAt) : ''}
                </Text>
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
