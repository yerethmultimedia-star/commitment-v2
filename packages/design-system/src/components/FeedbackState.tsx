import React from 'react';
import { YStack } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Title } from './typography/Title.js';
import { Body } from './typography/Body.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

/**
 * FeedbackState is the single shared implementation behind LoadingState,
 * EmptyState, and ErrorState — same icon/illustration slot, same
 * title/description, same primary/secondary action row, same spacing,
 * same accessibility. Each of the three only specializes behavior (a
 * default spinner for Loading, a danger tone for Error) on top of this,
 * the same "one base, thin behavioral wrappers" shape as SectionPrimitive.
 */
export type FeedbackText = { i18nKey: string; i18nParams?: Record<string, unknown> } | { text: string };
export type FeedbackTone = 'neutral' | 'danger';
export type FeedbackSpacing = 'compact' | 'default' | 'spacious';

export interface FeedbackStateProps {
  /** A small icon (e.g. lucide icon element). Mutually usable with `illustration` but distinct in purpose — prefer one, not both. */
  icon?: React.ReactNode;
  /** A larger illustration graphic — see `icon` above. */
  illustration?: React.ReactNode;
  title?: FeedbackText;
  description?: FeedbackText;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  /** Colors the title — 'danger' for error-style states. Default 'neutral'. */
  tone?: FeedbackTone;
  spacing?: FeedbackSpacing;
  /** Fills the available space and centers content — off by default so this also works inline (e.g. inside a Card). */
  fullscreen?: boolean;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}

const SPACING_GAP: Record<FeedbackSpacing, string> = { compact: '$2', default: '$4', spacious: '$6' };
const TONE_TITLE_COLOR: Record<FeedbackTone, string> = { neutral: '$contentPrimary', danger: '$danger' };

function resolveText(t: (key: string, params?: Record<string, unknown>) => string, value?: FeedbackText): string | undefined {
  if (!value) return undefined;
  return 'i18nKey' in value ? t(value.i18nKey, value.i18nParams) : value.text;
}

export const FeedbackState = React.forwardRef<any, FeedbackStateProps>((props, ref) => {
  const {
    icon,
    illustration,
    title,
    description,
    primaryAction,
    secondaryAction,
    tone = 'neutral',
    spacing = 'default',
    fullscreen = false,
    testID,
    accessibilityLabelI18nKey,
  } = props;
  const { t } = useTranslation();

  const resolvedTitle = resolveText(t, title);
  const resolvedDescription = resolveText(t, description);
  const resolvedAccessibilityLabel = accessibilityLabelI18nKey ? t(accessibilityLabelI18nKey) : resolvedTitle;

  return (
    <YStack
      ref={ref as any}
      testID={testID}
      flex={fullscreen ? 1 : undefined}
      alignItems="center"
      justifyContent={fullscreen ? 'center' : undefined}
      padding="$6"
      gap={SPACING_GAP[spacing] as any}
      accessible={!!resolvedAccessibilityLabel}
      {...toPlatformAccessibilityProps({ accessibilityLabel: resolvedAccessibilityLabel })}
    >
      {illustration}
      {icon}
      {resolvedTitle && (
        <Title fontSize="$6" fontWeight="bold" textAlign="center" color={TONE_TITLE_COLOR[tone] as any}>
          {resolvedTitle}
        </Title>
      )}
      {resolvedDescription && (
        <Body tone="secondary" fontSize="$4" textAlign="center" maxWidth={320}>
          {resolvedDescription}
        </Body>
      )}
      {(primaryAction || secondaryAction) && (
        <YStack gap="$2" marginTop="$2" width="100%" alignItems="center">
          {primaryAction}
          {secondaryAction}
        </YStack>
      )}
    </YStack>
  );
});

FeedbackState.displayName = 'FeedbackState';
