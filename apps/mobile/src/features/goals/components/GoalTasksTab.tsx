import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { Card, Body, EmptyState, LoadingState } from '@commitment/design-system';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useGoals } from '../hooks/useGoals';
import { CommitmentStatusBadge } from '@/features/commitments/components/CommitmentStatusBadge';
import { CommitmentPriorityBadge } from '@/features/commitments/components/CommitmentPriorityBadge';

/**
 * "Commitments" sub-tab — every Commitment across every Goal, flat. Reads
 * the same Commitment data as the Goal Workspace, nothing new fetched here.
 * Not to be confused with the separate features/tasks TasksScreen
 * (individual to-do items) — that stays as is. Renamed from "Tasks" per
 * ADR-019 (docs/03-architecture/adr_019_commitment_user_model.md), which
 * reserves "Tarea"/"Task" exclusively for the Task aggregate.
 */
export function GoalTasksTab() {
  const router = useRouter();
  const { data: commitments = [], isLoading } = useCommitments();
  const { data: goals = [] } = useGoals();

  const goalTitleById = useMemo(() => new Map(goals.map((g: any) => [g.id, g.title])), [goals]);

  if (isLoading) {
    return <LoadingState fullscreen={false} title={{ i18nKey: 'goals.list.loading' }} />;
  }

  if (commitments.length === 0) {
    return (
      <EmptyState
        fullscreen={false}
        title={{ i18nKey: 'goals.tasksTab.empty.title' }}
        description={{ i18nKey: 'goals.tasksTab.empty.description' }}
      />
    );
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
              <Body fontWeight="600" numberOfLines={2} ellipsizeMode="tail">{c.title}</Body>
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
