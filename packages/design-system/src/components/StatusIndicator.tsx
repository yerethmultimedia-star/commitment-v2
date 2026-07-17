import React from 'react';
import { View, Circle } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Label } from './typography/Label.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

/**
 * StatusIndicator communicates STATE (online/offline/synced/pending/failed),
 * not importance/category — that's Badge's job. A Feature reaching for a
 * pill-shaped, background-filled element to say "this is currently syncing"
 * should reach for StatusIndicator, not Badge; reaching for a small colored
 * dot + label to flag "high priority" would be the reverse mistake. See
 * Badge.tsx's own doc comment for the same distinction from the other side.
 */
export type StatusTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type StatusIndicatorSize = 'small' | 'medium' | 'large';
export type StatusIndicatorOrientation = 'horizontal' | 'vertical';

type StatusText =
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never };

export type StatusIndicatorProps = StatusText & {
  tone?: StatusTone;
  size?: StatusIndicatorSize;
  /** Shown instead of/alongside the dot — e.g. a small CloudOff icon for "offline". */
  icon?: React.ReactNode;
  /** Set false when `icon` alone should carry the signal. Default true. */
  showDot?: boolean;
  /** 'horizontal' (● Online) or 'vertical' (● above Online) — default 'horizontal'. */
  orientation?: StatusIndicatorOrientation;
  /** Clips long text to one line with an ellipsis instead of wrapping. Default false. */
  truncate?: boolean;
  accessibilityLabelI18nKey?: string;
  testID?: string;
};

// Reuses the same semantic tokens Badge's TONE_BG does — one tone
// vocabulary across both components, not two independently-tunable ones.
const TONE_DOT: Record<Exclude<StatusTone, 'neutral'>, string> = {
  accent: '$accent',
  success: '$success',
  warning: '$warning',
  danger: '$danger',
  info: '$info',
};

const SIZE_DOT: Record<StatusIndicatorSize, number> = { small: 6, medium: 8, large: 10 };
const SIZE_FONT: Record<StatusIndicatorSize, string> = { small: '$1', medium: '$2', large: '$3' };

export const StatusIndicator = React.forwardRef<any, StatusIndicatorProps>((props, ref) => {
  const {
    tone = 'neutral',
    size = 'medium',
    icon,
    showDot = true,
    orientation = 'horizontal',
    truncate = false,
    accessibilityLabelI18nKey,
    testID,
  } = props;
  const { t } = useTranslation();

  const dotColor = tone !== 'neutral' ? TONE_DOT[tone] : '$contentTertiary';
  const textColor = tone !== 'neutral' ? TONE_DOT[tone] : '$contentSecondary';

  const resolvedOwnText = props.i18nKey ? t(props.i18nKey, props.i18nParams) : props.label;
  const resolvedAccessibilityLabel = accessibilityLabelI18nKey ? t(accessibilityLabelI18nKey) : resolvedOwnText;

  const truncateProps = truncate ? { numberOfLines: 1, ellipsizeMode: 'tail' as const } : {};

  return (
    <View
      ref={ref as any}
      testID={testID}
      accessible={true}
      {...toPlatformAccessibilityProps({ accessibilityRole: 'text', accessibilityLabel: resolvedAccessibilityLabel })}
      flexDirection={orientation === 'horizontal' ? 'row' : 'column'}
      alignItems={orientation === 'horizontal' ? 'center' : 'flex-start'}
      gap="$1"
      alignSelf="flex-start"
      maxWidth={truncate ? '100%' : undefined}
    >
      {showDot && <Circle size={SIZE_DOT[size]} backgroundColor={dotColor as any} />}
      {icon}
      {props.i18nKey ? (
        <Label i18nKey={props.i18nKey} i18nParams={props.i18nParams} color={textColor as any} fontSize={SIZE_FONT[size] as any} fontWeight="600" {...truncateProps} />
      ) : (
        <Label color={textColor as any} fontSize={SIZE_FONT[size] as any} fontWeight="600" {...truncateProps}>
          {props.label}
        </Label>
      )}
    </View>
  );
});

StatusIndicator.displayName = 'StatusIndicator';
