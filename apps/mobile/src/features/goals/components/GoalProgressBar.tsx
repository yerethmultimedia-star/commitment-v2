import React from 'react';
import { XStack, View } from 'tamagui';
import { toPlatformAccessibilityProps } from '@commitment/design-system';

export interface GoalProgressBarProps {
  /** 0..1 */
  progress: number;
  height?: number;
  color?: string;
}

export function GoalProgressBar({ progress, height = 8, color = '$accent' }: GoalProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <XStack
      height={height}
      borderRadius={height / 2}
      backgroundColor="$surfaceRaised"
      overflow="hidden"
      {...toPlatformAccessibilityProps({ accessibilityRole: 'progressbar' })}
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <View
        height={height}
        width={`${clamped * 100}%` as any}
        backgroundColor={color as any}
        borderRadius={height / 2}
      />
    </XStack>
  );
}
