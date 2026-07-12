import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Card } from '@commitment/design-system';
import { Text, XStack, YStack } from 'tamagui';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';
import { useTranslation } from 'react-i18next';

export const UpcomingTasksWidget = React.memo(function UpcomingTasksWidget() {
  const { t } = useTranslation('common');
  const { data } = useDashboardQuery();
  const router = useRouter();

  const tasks = useMemo(() => data?.upcoming ?? [], [data?.upcoming]);

  return (
    <Card variant="elevated">
      <YStack gap="$3">
        <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
          {t('dashboard.widgets.upcoming.title')}
        </Text>

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
              >
                <Text color="$contentPrimary" fontSize="$4" numberOfLines={1} flex={1} marginRight="$2">
                  {task.title}
                </Text>
                <Text color="$contentSecondary" fontSize="$3">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                </Text>
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
