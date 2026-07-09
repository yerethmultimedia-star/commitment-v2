import React from 'react';
import { YStack, XStack, Stack } from 'tamagui';

export function DashboardSkeleton() {
  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" space="$6">
      {/* Header Skeleton */}
      <YStack space="$2">
        <Stack height={20} width={150} backgroundColor="$backgroundSecondary" borderRadius="$2" />
        <Stack height={32} width={250} backgroundColor="$divider" borderRadius="$2" />
        <Stack height={16} width={200} backgroundColor="$backgroundSecondary" borderRadius="$2" />
      </YStack>

      {/* Widgets Skeleton */}
      <YStack space="$4">
        {/* Today Widget Skeleton */}
        <Stack height={140} width="100%" backgroundColor="$surfaceRaised" borderRadius="$4" />
        
        {/* Weekly Progress Skeleton */}
        <Stack height={120} width="100%" backgroundColor="$surfaceRaised" borderRadius="$4" />
        
        {/* Streak Skeleton */}
        <XStack space="$4">
          <Stack flex={1} height={100} backgroundColor="$surfaceRaised" borderRadius="$4" />
          <Stack flex={1} height={100} backgroundColor="$surfaceRaised" borderRadius="$4" />
        </XStack>
      </YStack>
    </YStack>
  );
}
