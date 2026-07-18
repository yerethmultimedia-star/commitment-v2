import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { XStack, YStack, Circle } from 'tamagui';
import { Target } from '@tamagui/lucide-icons';
import { Card, Title, Body, toPlatformAccessibilityProps, EmptyState } from '@commitment/design-system';
import { useInsightsContext } from '../../hooks/useInsightsContext';
import { GoalProgressBar } from '@/features/goals/components/GoalProgressBar';

/** Per-Goal progress, real via computeGoalProgress (already computed upstream) — the centerpiece of the Goal-centric redesign. */
export function GoalProgressInsight() {
  const router = useRouter();
  const { context } = useInsightsContext();
  const goals = context?.goals ?? [];

  const sorted = useMemo(() => {
    const active = goals.filter((g) => g.state === 'Active').sort((a, b) => a.progress - b.progress);
    const rest = goals.filter((g) => g.state !== 'Active');
    return [...active, ...rest];
  }, [goals]);

  if (sorted.length === 0) {
    return (
      <Card variant="elevated">
        <EmptyState
          fullscreen={false}
          title={{ i18nKey: 'insights.goalProgress.empty.title' }}
          description={{ i18nKey: 'insights.goalProgress.empty.description' }}
        />
      </Card>
    );
  }

  return (
    <Card variant="elevated" gap="$3">
      <Title i18nKey="insights.goalProgress.title" fontSize="$5" />
      <YStack gap="$3">
        {sorted.map((goal) => {
          return (
            <YStack
              key={goal.goalId}
              gap="$2"
              onPress={() => router.push(`/goals/${goal.goalId}` as any)}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityLabel: goal.title,
              })}
            >
              <XStack gap="$3" alignItems="center">
                <Circle size={32} backgroundColor="$focus" justifyContent="center" alignItems="center">
                  <Target color="$accent" size={16} />
                </Circle>
                <Body fontWeight="600" flex={1} numberOfLines={1} ellipsizeMode="tail">{goal.title}</Body>
                <Body fontWeight="700" color="$accent">{Math.round(goal.progress * 100)}%</Body>
              </XStack>
              <GoalProgressBar progress={goal.progress} />
            </YStack>
          );
        })}
      </YStack>
    </Card>
  );
}
