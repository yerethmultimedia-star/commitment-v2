import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { Card, Body, toPlatformAccessibilityProps } from '@commitment/design-system';

import { useRouter } from 'expo-router';
import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';
import { TaskStatusBadge } from '@/features/tasks/components/TaskStatusBadge';

export const TodayWidget = React.memo(function TodayWidget() {
  // Still needed for the two accessibilityLabel sites below — Card supports
  // accessibilityLabelI18nKey, but the plain XStack task row doesn't have an
  // i18nKey-aware wrapper yet (see i18n Rule 2 audit finding).
  const { t } = useTranslation();
  const router = useRouter();
  const { data: dashboard } = useDashboardQuery();

  // useMemo used as per Track C performance requirements
  const tasks = useMemo(() => dashboard?.today ?? [], [dashboard?.today]);

  const onTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}` as any);
  };

  return (
    <Card variant="elevated">
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Body fontSize="$5" fontWeight="600" color="$contentPrimary" i18nKey="dashboard.widgets.today.title" />
          <Body
            fontSize="$4"
            color="$contentTertiary"
            accessibilityLabel={t('dashboard.widgets.today.remaining', { count: tasks.length })}
          >
            {tasks.length}
          </Body>
        </XStack>

        <YStack gap="$2">
          {tasks.length === 0 ? (
            <YStack padding="$4" alignItems="center" backgroundColor="$surface" borderRadius="$3">
              <Body color="$contentPrimary" fontWeight="bold" fontSize="$4" i18nKey="dashboard.widgets.today.empty.title" />
              <Body color="$contentSecondary" fontSize="$3" marginTop="$1" i18nKey="dashboard.widgets.today.empty.description" />
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
                onPress={() => onTaskPress(task.id)}
                pressStyle={{ opacity: 0.7 }}
                {...toPlatformAccessibilityProps({
                  accessibilityLabel: t('dashboard.widgets.today.itemA11y', { title: task.title }),
                  accessibilityRole: 'button',
                })}
              >
                <Body color="$contentPrimary" fontSize="$4" numberOfLines={1} flex={1}>
                  {task.title}
                </Body>
                {/* ADR-022 review note (2026-07-19): "today" now includes
                    Pending/In Progress/Blocked, which aren't the same kind
                    of work cognitively — a status-aware badge replaces the
                    old flat accent dot so each row is distinguishable at a
                    glance, reusing TaskStatusBadge rather than inventing a
                    new visual language (UX reuse mandate, ADR-022 §9). */}
                <TaskStatusBadge status={task.status} />
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
