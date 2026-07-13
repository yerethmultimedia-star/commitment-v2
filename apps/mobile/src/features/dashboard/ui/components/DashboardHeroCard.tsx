/**
 * DashboardHeroCard
 *
 * Presentational component that renders a HeroCardDescriptor.
 * Receives a pure descriptor — no data fetching, no store reads.
 */

import React from 'react';
import { XStack, YStack, Circle } from 'tamagui';
import { Title, Body, Card } from '@commitment/design-system';
import { useRouter } from 'expo-router';
import { HeroCardDescriptor } from '../../engine/layout/DashboardLayoutDescriptor';

export interface DashboardHeroCardProps {
  descriptor: HeroCardDescriptor;
}

export const DashboardHeroCard = React.memo(function DashboardHeroCard({
  descriptor,
}: DashboardHeroCardProps) {
  const router = useRouter();

  const heroBg =
    descriptor.themeVariant === 'success'
      ? '$success'
      : descriptor.themeVariant === 'accent'
      ? '$accent'
      : '$interactive';

  return (
    <Card
      variant="elevated"
      backgroundColor={heroBg as any}
      borderColor="transparent"
      padding="$4"
      onPress={() => router.push(descriptor.actionRoute as any)}
      pressStyle={{ scale: 0.98, opacity: 0.95 }}
      accessibilityRole="button"
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
            color="white"
            fontSize="$5"
            fontWeight="bold"
          />
          <Body
            i18nKey={descriptor.subtitleKey}
            i18nParams={descriptor.subtitleParams as Record<string, any>}
            color="rgba(255, 255, 255, 0.85)"
            fontSize="$3"
          />
        </YStack>
      </XStack>
    </Card>
  );
});
