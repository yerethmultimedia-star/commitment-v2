import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, Circle } from 'tamagui';
import { Card, Title, Body, ProgressMetric } from '@commitment/design-system';
import { CATEGORY_ICON, PRIORITY_COLOR, GoalCategory, GoalPriority } from '../utils/goal-descriptors';

export interface GoalCardProps {
  id: string;
  title: string;
  category: GoalCategory;
  priority: GoalPriority;
  progress: number;
}

export function GoalCard({ id, title, category, priority, progress }: GoalCardProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const Icon = CATEGORY_ICON[category];

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
            <Icon color="$accent" size={20} />
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
            <XStack gap="$2" alignItems="center">
              <Body tone="secondary" fontSize="$2">{t(`goals.categories.${category}`)}</Body>
              <Circle size={4} backgroundColor="$divider" />
              {/* A colored dot carries the priority signal instead of
                  colored text — danger/warning/success text-on-white all
                  measure under 3:1 contrast (see CommitmentStatusBadge). */}
              <Circle size={6} backgroundColor={PRIORITY_COLOR[priority] as any} />
              <Body tone="secondary" fontSize="$2" fontWeight="600">
                {t(`goals.priority.${priority}`)}
              </Body>
            </XStack>
          </YStack>
          <Body fontWeight="700" color="$accent">{Math.round(progress * 100)}%</Body>
        </XStack>
        <ProgressMetric progress={progress} variant="linear" size="medium" showPercentage={false} />
      </YStack>
    </Card>
  );
}
