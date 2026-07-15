import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { YStack } from 'tamagui';
import { useTheme } from 'tamagui';
import { Title } from '@commitment/design-system';

export interface CircularProgressProps {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function CircularProgress({ progress, size = 96, strokeWidth = 10, color = '$accent' }: CircularProgressProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  const strokeColor = (theme as any)[color.replace('$', '')]?.get?.() ?? theme.accent?.get?.() ?? '#6C4EFF';
  const trackColor = theme.focus?.get?.() ?? '#E5E5EA';

  return (
    <YStack width={size} height={size} alignItems="center" justifyContent="center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <Title fontSize="$title" lineHeight="$title">{Math.round(clamped * 100)}%</Title>
    </YStack>
  );
}
