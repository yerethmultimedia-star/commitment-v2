import React from 'react';
import { useRouter } from 'expo-router';
import { XStack, YStack, Circle } from 'tamagui';
import { Target } from '@tamagui/lucide-icons';
import { Card, Title, Body, ProgressMetric } from '@commitment/design-system';
import { GoalViewModel } from '../models/goal.model';

export interface GoalCardProps {
  goal: GoalViewModel;
}

// Category/priority icons and colors were removed (2026-07-17) — presentation-only,
// never a real domain concept (see goal_view_alignment_assessment.md). Target is a
// fixed, generic Goal icon now, not derived from any per-Goal field.
export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const { id, title, progress } = goal;

  return (
    <Card
      variant="elevated"
      clickable
      onPress={() => router.push(`/goals/${id}` as any)}
      pressStyle={{ opacity: 0.9 }}
      accessibilityLabel={title}
    >
      <YStack gap="$3">
        <XStack gap="$3" alignItems="center">
          <Circle size={40} backgroundColor="$focus" justifyContent="center" alignItems="center">
            <Target color="$accent" size={20} />
          </Circle>
          <YStack flex={1}>
            {/* minHeight reserves 2 lines' worth of space so every card is
                still the same height whether the title takes 1 or 2 lines —
                numberOfLines=2 (not 1) per TECH_DEBT P5: single-line
                ellipsis was cutting titles mid-word ("Learn conversational
                Portugu..."). */}
            <YStack minHeight={42} justifyContent="center">
              <Title fontSize="$subtitle" lineHeight="$subtitle" numberOfLines={2} ellipsizeMode="tail">{title}</Title>
            </YStack>
          </YStack>
          <Body fontWeight="700" color="$accent">{Math.round(progress * 100)}%</Body>
        </XStack>
        <ProgressMetric progress={progress} variant="linear" size="medium" showPercentage={false} />
      </YStack>
    </Card>
  );
}
