import React from 'react';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { YStack, XStack, useTheme } from 'tamagui';
import { Title } from './typography/Title.js';
import { Label } from './typography/Label.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

/**
 * ProgressMetric is the ratio one: a value framed as progress toward a
 * target (0..1), not a raw count — that distinction is why it isn't just
 * MetricCard with a percentage sign. Generalizes the existing
 * `features/goals/components/CircularProgress.tsx` (kept working as-is;
 * migrating its call sites to this component is a Fase B decision, not
 * done here) and adds a linear-bar variant for the many places a full ring
 * is too heavy (an inline "3/5 tasks" row, for instance).
 *
 * ARCHITECTURAL TODO (not an implementation nitpick — a deliberate,
 * deferred decision): split into low-level `ProgressRing` + `ProgressBar`
 * once a second independent consumer of either shape appears (candidates:
 * Coach for a ring, Calendar for a bar), with `ProgressMetric` composing
 * whichever one `variant` selects. Not done now because a `variant` switch
 * with exactly one real consumer per branch is speculative generality, not
 * a supported pattern here — see TD-012's own reasoning for why "wait for
 * a real second consumer" applies the same way to `Card`.
 */
export type ProgressMetricTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressMetricVariant = 'circular' | 'linear';
export type ProgressMetricSize = 'small' | 'medium' | 'large';

type OptionalLabelText =
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never }
  | { i18nKey?: never; label?: never; i18nParams?: never };

export type ProgressMetricProps = OptionalLabelText & {
  /** 0..1 */
  progress: number;
  variant?: ProgressMetricVariant;
  size?: ProgressMetricSize;
  tone?: ProgressMetricTone;
  /** Shows the computed "72%" text — inside the ring for circular, beside the bar for linear. Default true. */
  showPercentage?: boolean;
  testID?: string;
};

const TONE_COLOR: Record<Exclude<ProgressMetricTone, 'neutral'>, string> = {
  accent: '$accent',
  success: '$success',
  warning: '$warning',
  danger: '$danger',
  info: '$info',
};

const CIRCULAR_SIZE: Record<ProgressMetricSize, { diameter: number; stroke: number }> = {
  small: { diameter: 48, stroke: 5 },
  medium: { diameter: 96, stroke: 10 },
  large: { diameter: 140, stroke: 14 },
};

const LINEAR_HEIGHT: Record<ProgressMetricSize, number> = { small: 4, medium: 8, large: 12 };

export const ProgressMetric = React.forwardRef<any, ProgressMetricProps>((props, ref) => {
  const { progress, variant = 'circular', size = 'medium', tone = 'accent', showPercentage = true, testID } = props;
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const percentageLabel = `${Math.round(clamped * 100)}%`;

  const fillToken = tone !== 'neutral' ? TONE_COLOR[tone] : '$contentSecondary';
  const fillColor = (theme as any)[fillToken.replace('$', '')]?.get?.() ?? theme.accent?.get?.() ?? '#6C4EFF';
  const trackColor = theme.focus?.get?.() ?? '#E5E5EA';

  const labelNode = props.i18nKey ? (
    <Label i18nKey={props.i18nKey} i18nParams={props.i18nParams} color="$contentSecondary" fontSize="$2" />
  ) : props.label ? (
    <Label color="$contentSecondary" fontSize="$2">
      {props.label}
    </Label>
  ) : null;

  // Found during the Goals adoption pass (2026-07-15): the two components
  // this generalizes (CircularProgress, GoalProgressBar) both exposed
  // accessibilityRole="progressbar" + aria-value*; this shared replacement
  // hadn't yet — fixed here, once, for every consumer (Dashboard included),
  // same "single point of adaptation" shape as toPlatformAccessibilityProps
  // itself, not a per-consumer patch.
  const progressA11yProps = toPlatformAccessibilityProps({
    accessibilityRole: 'progressbar',
    accessibilityValue: { now: Math.round(clamped * 100), min: 0, max: 100 },
  });

  if (variant === 'linear') {
    const height = LINEAR_HEIGHT[size];
    return (
      <YStack ref={ref as any} testID={testID} gap="$1" width="100%">
        {(labelNode || showPercentage) && (
          <XStack justifyContent="space-between" alignItems="center">
            {labelNode}
            {showPercentage && (
              <Label color="$contentSecondary" fontSize="$2">
                {percentageLabel}
              </Label>
            )}
          </XStack>
        )}
        <YStack width="100%" height={height} borderRadius="full" backgroundColor="$focus" overflow="hidden" {...progressA11yProps}>
          <YStack width={`${clamped * 100}%`} height="100%" borderRadius="full" backgroundColor={fillToken as any} />
        </YStack>
      </YStack>
    );
  }

  const { diameter, stroke } = CIRCULAR_SIZE[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <YStack ref={ref as any} testID={testID} alignItems="center" gap="$2" {...progressA11yProps}>
      <YStack width={diameter} height={diameter} alignItems="center" justifyContent="center">
        <Svg width={diameter} height={diameter} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <SvgCircle cx={diameter / 2} cy={diameter / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
          <SvgCircle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={fillColor}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        {showPercentage && (
          <Title fontSize="$title" lineHeight="$title">
            {percentageLabel}
          </Title>
        )}
      </YStack>
      {labelNode}
    </YStack>
  );
});

ProgressMetric.displayName = 'ProgressMetric';
