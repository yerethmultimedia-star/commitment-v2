import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Card } from '@commitment/design-system';
import { Text, XStack, YStack } from 'tamagui';
import { formatDate } from '@commitment/localization';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';
import { useTranslation } from 'react-i18next';

const VISIBLE_COUNT = 5;

export const UpcomingTasksWidget = React.memo(function UpcomingTasksWidget() {
  const { t } = useTranslation('common');
  const { data } = useDashboardQuery();
  const router = useRouter();

  const allTasks = useMemo(() => data?.upcoming ?? [], [data?.upcoming]);
  const tasks = useMemo(() => allTasks.slice(0, VISIBLE_COUNT), [allTasks]);

  return (
    <Card variant="elevated">
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
            {t('dashboard.widgets.upcoming.title')}
          </Text>
          <Text fontSize="$4" color="$contentTertiary">{allTasks.length}</Text>
        </XStack>

        <YStack gap="$2">
          {tasks.length === 0 ? (
            <Text color="$contentSecondary" fontSize="$3">
              {t('dashboard.widgets.upcoming.empty')}
            </Text>
          ) : (
            tasks.map(task => (
              <XStack
                key={task.id}
                onPress={() => router.push('/(tabs)/tasks' as any)}
                pressStyle={{ opacity: 0.7 }}
                justifyContent="space-between"
                backgroundColor="$surface"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$divider"
                alignItems="center"
                accessibilityRole="button"
                accessibilityLabel={task.title}
              >
                <Text color="$contentPrimary" fontSize="$4" numberOfLines={1} flex={1} marginRight="$2">
                  {task.title}
                </Text>
                <Text color="$contentSecondary" fontSize="$3">
                  {task.dueDate ? formatDate(task.dueDate) : ''}
                </Text>
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
