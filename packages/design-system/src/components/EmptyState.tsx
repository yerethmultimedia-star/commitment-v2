import React from 'react';
import { YStack, Text } from 'tamagui';
import { Animated } from 'react-native';
import { useFadeIn } from '../hooks/useMotion.js';

export interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  const { opacity } = useFadeIn(500);

  return (
    <Animated.View style={{ flex: 1, opacity }}>
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$6"
        gap="$4"
      >
        {illustration}
        <Text fontSize="$6" fontWeight="600" color="$contentPrimary" textAlign="center">
          {title}
        </Text>
        {description && (
          <Text fontSize="$4" color="$contentSecondary" textAlign="center" maxWidth={300}>
            {description}
          </Text>
        )}
        {action && (
          <YStack marginTop="$4">
            {action}
          </YStack>
        )}
      </YStack>
    </Animated.View>
  );
}
