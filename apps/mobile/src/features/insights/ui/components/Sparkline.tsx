import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from 'tamagui';
import { computeSparklinePoints, toPolylinePointsAttr } from '../../engine/sparkline-math';

export interface SparklineProps {
  points: readonly number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

/** Small embedded trend line for stat cards. Kept feature-side (not design-system), matching CircularProgress.tsx's own precedent — design-system doesn't declare react-native-svg as a dependency. */
export function Sparkline({ points, width = 64, height = 24, color = '$accent', strokeWidth = 2 }: SparklineProps) {
  const theme = useTheme();
  const svgPoints = computeSparklinePoints(points, width, height);

  if (svgPoints.length < 2) return null;

  const strokeColor = (theme as any)[color.replace('$', '')]?.get?.() ?? theme.accent?.get?.() ?? '#6C4EFF';

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={toPolylinePointsAttr(svgPoints)}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
