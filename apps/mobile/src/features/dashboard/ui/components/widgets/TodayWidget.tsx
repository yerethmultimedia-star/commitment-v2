import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';

import { useRouter } from 'expo-router';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

export const TodayWidget = React.memo(function TodayWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: dashboard } = useDashboardQuery();

  // useMemo used as per Track C performance requirements
  const tasks = useMemo(() => dashboard?.today ?? [], [dashboard?.today]);

  const onTaskPress = () => {
    router.push('/(tabs)/tasks' as any);
  };

  return (
    <Card variant="elevated">
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
            {t('dashboard.widgets.today.title')}
          </Text>
          <Text fontSize="$4" color="$contentTertiary" accessibilityLabel={t('dashboard.widgets.today.remaining', { count: tasks.length })}>
            {tasks.length}
          </Text>
        </XStack>

        <YStack gap="$2">
          {tasks.length === 0 ? (
            <YStack padding="$4" alignItems="center" backgroundColor="$surface" borderRadius="$3">
              <Text color="$contentPrimary" fontWeight="bold" fontSize="$4">
                {t('dashboard.widgets.today.empty.title')}
              </Text>
              <Text color="$contentSecondary" fontSize="$3" marginTop="$1">
                {t('dashboard.widgets.today.empty.description')}
              </Text>
            </YStack>
          ) : (
            tasks.slice(0, 3).map((task) => (
              <XStack
                key={task.id}
                backgroundColor="$surface"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$divider"
                alignItems="center"
                onPress={onTaskPress}
                pressStyle={{ opacity: 0.7 }}
                accessibilityLabel={t('dashboard.widgets.today.itemA11y', { title: task.title })}
                accessibilityRole="button"
              >
                <YStack width={12} height={12} borderRadius={6} backgroundColor="$accent" marginRight="$3" />
                <Text color="$contentPrimary" fontSize="$4" numberOfLines={1} flex={1}>
                  {task.title}
                </Text>
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
