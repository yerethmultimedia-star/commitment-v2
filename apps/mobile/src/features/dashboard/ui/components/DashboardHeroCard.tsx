/**
 * DashboardHeroCard
 *
 * Presentational component that renders a HeroCardDescriptor.
 * Receives a pure descriptor — no data fetching, no store reads.
 *
 * Two kinds share this component: 'priorityTask' (today's single
 * highest-scoring task, regardless of origin — commitment, direct goal, or
 * independent — the primary Today anchor) and 'generic' (the original
 * recommendation-driven, i18n-templated hero, kept as a fallback for when
 * there's no pending task today — see DashboardLayoutEngine.resolveHero()).
 *
 * The 'priorityTask' structure is always Title/Subtitle(contextLabel),
 * regardless of the task's origin — the progress metric is the only element
 * that varies (shown only when the task is commitment-linked), so origin
 * never changes the card's visual shape.
 */

import React from 'react';
import { XStack, YStack, Circle } from 'tamagui';
import { Title, Body, Card, Badge, ProgressMetric, BadgeTone } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { HeroCardDescriptor } from '../../engine/layout/DashboardLayoutDescriptor';

export interface DashboardHeroCardProps {
  descriptor: HeroCardDescriptor;
}

// Same 3-level mapping CommitmentPriorityBadge.tsx defines for its own
// bounded context — kept as a local literal here too rather than a
// cross-feature import (this is Task's priority, a different context).
const PRIORITY_TONE: Record<'high' | 'medium' | 'low', BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

export const DashboardHeroCard = React.memo(function DashboardHeroCard({
  descriptor,
}: DashboardHeroCardProps) {
  const router = useRouter();
  const { t } = useTranslation('common');

  if (descriptor.kind === 'priorityTask') {
    const priority = descriptor.priority!;

    return (
      <YStack gap="$2">
        <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
          {t('dashboard.hero.priorityTask.label')}
        </Body>
        <Card
          variant="elevated"
          clickable
          onPress={() => router.push(descriptor.actionRoute as any)}
          pressStyle={{ scale: 0.98, opacity: 0.95 }}
          accessibilityLabel={descriptor.taskTitle}
        >
          <XStack gap="$3" alignItems="center" justifyContent="space-between">
            <YStack flex={1} gap="$2">
              <Title fontSize="$5" fontWeight="bold" numberOfLines={1} ellipsizeMode="tail">
                {descriptor.taskTitle}
              </Title>
              <XStack gap="$2" alignItems="center">
                <Body tone="secondary" fontSize="$3" numberOfLines={1} flex={1}>
                  {descriptor.contextLabel}
                </Body>
                <Badge tone={PRIORITY_TONE[priority]} size="small" i18nKey={`dashboard.hero.priorityTask.priority.${priority}`} i18nParams={{ ns: 'common' }} />
              </XStack>
            </YStack>
            {descriptor.progressRatio !== undefined && (
              <ProgressMetric progress={descriptor.progressRatio} size="small" />
            )}
          </XStack>
        </Card>
      </YStack>
    );
  }

  const heroBg =
    descriptor.themeVariant === 'success'
      ? '$success'
      : descriptor.themeVariant === 'accent'
      ? '$accent'
      : '$interactive';

  // success uses contentOnSemantic, accent/interactive use contentOnAccent —
  // some themes' accent is too light for white text to clear WCAG AA, so
  // this can't be a fixed "white" (see ResolvedTheme.ts / VS-031 theme audit).
  const heroTextColor = descriptor.themeVariant === 'success' ? '$contentOnSemantic' : '$contentOnAccent';

  return (
    <Card
      variant="elevated"
      clickable
      backgroundColor={heroBg as any}
      borderColor="transparent"
      padding="$4"
      onPress={() => router.push(descriptor.actionRoute as any)}
      pressStyle={{ scale: 0.98, opacity: 0.95 }}
      accessibilityLabel={descriptor.titleKey}
    >
      <XStack gap="$3" alignItems="center">
        <Circle size={50} justifyContent="center" alignItems="center">
          {/* Translucent backing layer kept separate from the emoji sibling
              below — opacity on a shared parent would fade the emoji too. */}
          <Circle position="absolute" size={50} backgroundColor={heroTextColor as any} opacity={0.2} />
          <Body fontSize="$6">{descriptor.illustration}</Body>
        </Circle>

        <YStack flex={1} gap="$1">
          <Title
            i18nKey={descriptor.titleKey}
            i18nParams={descriptor.titleParams as Record<string, any>}
            color={heroTextColor as any}
            fontSize="$5"
            fontWeight="bold"
          />
          <Body
            i18nKey={descriptor.subtitleKey}
            i18nParams={descriptor.subtitleParams as Record<string, any>}
            color={heroTextColor as any}
            opacity={0.85}
            fontSize="$3"
          />
        </YStack>
      </XStack>
    </Card>
  );
});
