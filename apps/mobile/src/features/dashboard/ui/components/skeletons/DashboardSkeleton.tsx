import React from 'react';
import { YStack, XStack } from 'tamagui';

export function DashboardSkeleton() {
  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$6">
      {/* Header Skeleton */}
      <YStack gap="$2">
        <YStack height={20} width={150} backgroundColor="$backgroundSecondary" borderRadius="$2" />
        <YStack height={32} width={250} backgroundColor="$divider" borderRadius="$2" />
        <YStack height={16} width={200} backgroundColor="$backgroundSecondary" borderRadius="$2" />
      </YStack>

      {/* Widgets Skeleton */}
      <YStack gap="$4">
        {/* Today Widget Skeleton */}
        <YStack height={140} width="100%" backgroundColor="$surfaceRaised" borderRadius="$4" />
        
        {/* Weekly Progress Skeleton */}
        <YStack height={120} width="100%" backgroundColor="$surfaceRaised" borderRadius="$4" />
        
        {/* Streak Skeleton */}
        <XStack gap="$4">
          <YStack flex={1} height={100} backgroundColor="$surfaceRaised" borderRadius="$4" />
          <YStack flex={1} height={100} backgroundColor="$surfaceRaised" borderRadius="$4" />
        </XStack>
      </YStack>
    </YStack>
  );
}
