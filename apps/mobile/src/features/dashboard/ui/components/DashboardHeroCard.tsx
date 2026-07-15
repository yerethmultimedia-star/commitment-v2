/**
 * DashboardHeroCard
 *
 * Presentational component that renders a HeroCardDescriptor.
 * Receives a pure descriptor — no data fetching, no store reads.
 *
 * Two kinds share this component: 'priorityTask' (today's single
 * highest-priority task + its parent commitment's real progress — the
 * primary Today anchor) and 'generic' (the original recommendation-driven,
 * i18n-templated hero, kept as a fallback for when there's no real priority
 * task to show — see DashboardLayoutEngine.resolveHero()).
 */

import React from 'react';
import { XStack, YStack, Circle } from 'tamagui';
import { Title, Body, Card } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { HeroCardDescriptor } from '../../engine/layout/DashboardLayoutDescriptor';
import { CircularProgress } from '@/features/goals/components/CircularProgress';
import { PRIORITY_COLOR } from '@/features/tasks/utils/task-descriptors';

export interface DashboardHeroCardProps {
  descriptor: HeroCardDescriptor;
}

export const DashboardHeroCard = React.memo(function DashboardHeroCard({
  descriptor,
}: DashboardHeroCardProps) {
  const router = useRouter();
  const { t } = useTranslation('common');

  if (descriptor.kind === 'priorityTask') {
    const priority = descriptor.priority!;
    const priorityColor = PRIORITY_COLOR[priority];

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
                  {descriptor.commitmentTitle}
                </Body>
                <XStack
                  backgroundColor={priorityColor.bg as any}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Body fontSize="$2" fontWeight="600" color={priorityColor.text as any}>
                    {t(`dashboard.hero.priorityTask.priority.${priority}`)}
                  </Body>
                </XStack>
              </XStack>
            </YStack>
            <CircularProgress progress={descriptor.progressRatio ?? 0} size={56} strokeWidth={6} />
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
        <Circle
          size={50}
          backgroundColor="rgba(255, 255, 255, 0.2)"
          justifyContent="center"
          alignItems="center"
        >
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
