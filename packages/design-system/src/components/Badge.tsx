import React from 'react';
import { View } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Label } from './typography/Label.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeVariant = 'filled' | 'outlined';
export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeShape = 'pill' | 'rounded' | 'square';

/**
 * Exactly one of `i18nKey`/`label` — never both, never neither. `i18nKey` is
 * for translatable text (mirrors Button/TextBase's discipline). `label` is
 * the escape hatch for content that is not a translation by nature (version
 * strings, percentages, units, brand names like "AI"/"Beta") — forcing these
 * through fake i18n keys (`badge.version.v2_0_1`) would defeat the purpose
 * of the Localization SDK, not serve it.
 */
type BadgeText =
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never };

export type BadgeProps = BadgeText & {
  /**
   * Semantic meaning, not visual category — a Feature choosing 'danger' for
   * "high priority" and 'danger' for "cancelled status" is correct: both are
   * negative/urgent signals. Badge has no concept of "status" or "priority"
   * itself; that mapping belongs to the Feature (see CommitmentStatusBadge/
   * CommitmentPriorityBadge for the pattern).
   */
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  /** Overrides the accessible name — defaults to the resolved badge text. */
  accessibilityLabelI18nKey?: string;
  accessibilityHintI18nKey?: string;
  testID?: string;
};

// tone -> semantic token pairing. contentOnAccent/contentOnSemantic are the
// same WCAG-AA-verified-per-theme text pairings Button already uses (see
// Button.tsx's own comment) — reused here rather than re-deriving new pairs.
const TONE_BG: Record<Exclude<BadgeTone, 'neutral'>, string> = {
  accent: '$accent',
  success: '$success',
  warning: '$warning',
  danger: '$danger',
  info: '$info',
};

const TONE_TEXT: Record<Exclude<BadgeTone, 'neutral'>, string> = {
  accent: '$contentOnAccent',
  success: '$contentOnSemantic',
  warning: '$contentOnSemantic',
  danger: '$contentOnSemantic',
  info: '$contentOnSemantic',
};

const SIZE_HEIGHT: Record<BadgeSize, number> = { small: 20, medium: 24, large: 28 };
const SIZE_PADDING_X: Record<BadgeSize, string> = { small: '$1', medium: '$2', large: '$3' };
const SIZE_FONT: Record<BadgeSize, string> = { small: '$1', medium: '$2', large: '$3' };

// pill = fully rounded (current/default look); rounded matches the same $4
// radius Button/Card/Input already use elsewhere; square = no radius. Frozen
// now even though only 'pill' has a real caller today (Calendar event chips
// are the anticipated first consumer of 'rounded'/'square').
const SHAPE_RADIUS: Record<BadgeShape, string> = { pill: 'full', rounded: '$4', square: '$0' };

export const Badge = React.forwardRef<any, BadgeProps>((props, ref) => {
  const {
    tone = 'neutral',
    variant = 'filled',
    size = 'medium',
    shape = 'pill',
    iconStart,
    iconEnd,
    accessibilityLabelI18nKey,
    accessibilityHintI18nKey,
    testID,
  } = props;
  const { t } = useTranslation();

  const semanticBg = tone !== 'neutral' ? TONE_BG[tone] : '$surfaceRaised';
  const semanticText = tone !== 'neutral' ? TONE_TEXT[tone] : '$contentSecondary';

  // Outlined: border + text carry the tone's color, background stays
  // transparent so it works over any surface, not just $background.
  const backgroundColor = variant === 'filled' ? semanticBg : 'transparent';
  const textColor = variant === 'filled' ? semanticText : tone !== 'neutral' ? semanticBg : '$contentSecondary';
  // Neutral+filled gets a border too — $surfaceRaised can sit close enough
  // to a card's own background that a fill-only pill reads as plain text
  // (the exact "Baja priority" bug this component was built to fix, see
  // TECH_DEBT.md Item 9). Every other tone/variant combination already has
  // a strong enough color difference from typical surfaces to not need one.
  const showBorder = variant === 'outlined' || tone === 'neutral';
  const borderColor = !showBorder
    ? 'transparent'
    : variant === 'outlined' && tone !== 'neutral'
      ? semanticBg
      : '$divider';

  // Resolve the accessible name: explicit override > the badge's own visible
  // text (i18nKey resolved through t(), or the raw label as-is).
  const resolvedOwnText = props.i18nKey ? t(props.i18nKey, props.i18nParams) : props.label;
  const resolvedAccessibilityLabel = accessibilityLabelI18nKey ? t(accessibilityLabelI18nKey) : resolvedOwnText;
  const resolvedAccessibilityHint = accessibilityHintI18nKey ? t(accessibilityHintI18nKey) : undefined;

  return (
    <View
      ref={ref as any}
      testID={testID}
      accessible={true}
      {...toPlatformAccessibilityProps({
        accessibilityRole: 'text',
        accessibilityLabel: resolvedAccessibilityLabel,
        accessibilityHint: resolvedAccessibilityHint,
      })}
      height={SIZE_HEIGHT[size]}
      paddingHorizontal={SIZE_PADDING_X[size] as any}
      backgroundColor={backgroundColor as any}
      borderColor={borderColor as any}
      borderWidth={showBorder ? 1 : 0}
      borderRadius={SHAPE_RADIUS[shape] as any}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap="$1"
      alignSelf="flex-start"
    >
      {iconStart}
      {props.i18nKey ? (
        <Label i18nKey={props.i18nKey} i18nParams={props.i18nParams} color={textColor as any} fontSize={SIZE_FONT[size] as any} fontWeight="bold" />
      ) : (
        <Label color={textColor as any} fontSize={SIZE_FONT[size] as any} fontWeight="bold">
          {props.label}
        </Label>
      )}
      {iconEnd}
    </View>
  );
});

Badge.displayName = 'Badge';
