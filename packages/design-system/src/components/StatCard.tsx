import React from 'react';
import { YStack, XStack } from 'tamagui';
import { Card } from './Card.js';
import { Title } from './typography/Title.js';
import { Body } from './typography/Body.js';

/**
 * StatCard is the richer one: a single headline metric plus an optional
 * trend/delta line and an optional visual (chart/sparkline) slot. Built for
 * "how am I doing on X this period" summaries (Insights' weekly overview is
 * the reference use case this generalizes). Unlike MetricCard, it always
 * carries period/trend context — if there's no delta and no visual, reach
 * for MetricCard instead, it's the right-sized component for a bare count.
 *
 * StatCard deliberately does NOT format or translate the delta text itself
 * — `deltaLabel` is a fully resolved string the Feature already ran through
 * its own i18n (e.g. t('insights.overview.deltaVsLastWeek', {...})).
 * Keeping that composition in the Feature is what keeps this component
 * domain-agnostic — a generic "+N vs last period" formatter would still be
 * hardcoding an assumption about what's being compared.
 */
export type StatTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type StatDeltaTone = 'positive' | 'negative' | 'neutral';

type StatTitleText =
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never };

export type StatCardProps = StatTitleText & {
  value: string | number;
  deltaLabel?: string;
  /** Colors `deltaLabel` — omit to render it in the default secondary tone. */
  deltaTone?: StatDeltaTone;
  /** Caller-supplied chart/sparkline/etc — StatCard only reserves the layout slot. */
  visual?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
};

const DELTA_COLOR: Record<StatDeltaTone, string> = {
  positive: '$success',
  negative: '$danger',
  neutral: '$contentSecondary',
};

export const StatCard = React.forwardRef<any, StatCardProps>((props, ref) => {
  const { value, deltaLabel, deltaTone = 'neutral', visual, onPress, testID } = props;

  return (
    <Card ref={ref as any} variant="elevated" clickable={!!onPress} onPress={onPress} testID={testID} gap="$2">
      {props.i18nKey ? (
        <Body i18nKey={props.i18nKey} i18nParams={props.i18nParams} tone="secondary" fontSize="$2" />
      ) : (
        <Body tone="secondary" fontSize="$2">
          {props.label}
        </Body>
      )}
      <XStack alignItems="flex-end" justifyContent="space-between" gap="$2">
        <YStack gap="$1">
          <Title fontSize="$7" fontWeight="bold">
            {value}
          </Title>
          {deltaLabel && (
            <Body fontSize="$2" color={DELTA_COLOR[deltaTone] as any}>
              {deltaLabel}
            </Body>
          )}
        </YStack>
        {visual}
      </XStack>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
