import React from 'react';
import { XStack } from 'tamagui';
import { Card } from './Card.js';
import { Title } from './typography/Title.js';
import { Label } from './typography/Label.js';

/**
 * MetricCard is the compact one: a single number/short value + a short
 * label, optionally with an icon. Built for grids of 3-5 quick counts
 * (e.g. "12 Goals · 84% · 32 Tasks · 7 Habits"). It has no trend and no
 * visual (chart/sparkline) slot — that richer case is StatCard's job, not
 * this one's. See StatCard.tsx and ProgressMetric.tsx for the other two
 * members of this family and how their purposes differ.
 */
export type MetricTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

type MetricLabelText =
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never };

export type MetricCardProps = MetricLabelText & {
  /** Always a pre-formatted, already-localized value — MetricCard doesn't format numbers itself. */
  value: string | number;
  tone?: MetricTone;
  icon?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
};

const TONE_COLOR: Record<Exclude<MetricTone, 'neutral'>, string> = {
  accent: '$accent',
  success: '$success',
  warning: '$warning',
  danger: '$danger',
  info: '$info',
};

export const MetricCard = React.forwardRef<any, MetricCardProps>((props, ref) => {
  const { value, tone = 'neutral', icon, onPress, testID } = props;
  const valueColor = tone !== 'neutral' ? TONE_COLOR[tone] : '$contentPrimary';

  return (
    <Card ref={ref as any} variant="elevated" clickable={!!onPress} onPress={onPress} testID={testID} padding="$3" gap="$1">
      {icon && <XStack marginBottom="$1">{icon}</XStack>}
      <Title fontSize="$7" fontWeight="bold" color={valueColor as any}>
        {value}
      </Title>
      {props.i18nKey ? (
        <Label i18nKey={props.i18nKey} i18nParams={props.i18nParams} color="$contentSecondary" fontSize="$2" />
      ) : (
        <Label color="$contentSecondary" fontSize="$2">
          {props.label}
        </Label>
      )}
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';
