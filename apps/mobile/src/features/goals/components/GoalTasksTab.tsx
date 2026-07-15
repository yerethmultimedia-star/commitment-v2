import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { Card, Body } from '@commitment/design-system';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useGoals } from '../hooks/useGoals';
import { CommitmentStatusBadge } from '@/features/commitments/components/CommitmentStatusBadge';
import { CommitmentPriorityBadge } from '@/features/commitments/components/CommitmentPriorityBadge';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { useTranslation } from 'react-i18next';

/**
 * "Tasks" sub-tab — every Commitment across every Goal, flat. Labeled
 * "Tasks" to match how the user thinks about commitments (VS-031 product
 * feedback); still reads the same Commitment data as the Goal Workspace,
 * nothing new fetched here. Not to be confused with the separate
 * features/tasks TasksScreen (individual to-do items) — that stays as is.
 */
export function GoalTasksTab() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: commitments = [], isLoading } = useCommitments();
  const { data: goals = [] } = useGoals();

  const goalTitleById = useMemo(() => new Map(goals.map((g: any) => [g.id, g.title])), [goals]);

  if (isLoading) {
    return <Body i18nKey="goals.list.loading" tone="secondary" />;
  }

  if (commitments.length === 0) {
    return <EmptyState title={t('goals.tasksTab.empty.title')} description={t('goals.tasksTab.empty.description')} />;
  }

  return (
    <YStack gap="$3">
      {commitments.map((c) => (
        <Card
          key={c.id}
          variant="elevated"
          clickable
          onPress={() => router.push(`/commitments/${c.id}` as any)}
          pressStyle={{ opacity: 0.9 }}
          accessibilityLabel={c.title}
        >
          <XStack justifyContent="space-between" alignItems="center" gap="$2">
            <YStack flex={1}>
              <Body fontWeight="600" numberOfLines={1} ellipsizeMode="tail">{c.title}</Body>
              {c.goalId && goalTitleById.has(c.goalId) && (
                <Body tone="secondary" fontSize="$2" numberOfLines={1} ellipsizeMode="tail">{goalTitleById.get(c.goalId)}</Body>
              )}
            </YStack>
            <XStack gap="$2" alignItems="center">
              <CommitmentPriorityBadge priority={c.priority} />
              <CommitmentStatusBadge status={c.status} />
            </XStack>
          </XStack>
        </Card>
      ))}
    </YStack>
  );
}
