import React from 'react';
import { YStack, XStack } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Title } from './typography/Title.js';
import { Body } from './typography/Body.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

/**
 * SectionPrimitive is the single shared implementation behind SectionHeader,
 * FormSection, and SettingsSection — same spacing scale, same title/subtitle/
 * action row, same divider, same accessibility. Only the *body wrapping*
 * differs per consumer (no body for SectionHeader, a plain stack for
 * FormSection, a divided Card for SettingsSection) — that's implemented in
 * each consumer, not here, so this file stays a pure header+spacing
 * primitive rather than growing a `variant` switch that re-creates the same
 * "one component does everything" problem this family exists to avoid (see
 * ProgressMetric.tsx's own note on the same principle).
 */
export type SectionText = { i18nKey: string; i18nParams?: Record<string, unknown> } | { text: string };
export type SectionHeaderSize = 'section' | 'screen';
export type SectionSpacing = 'compact' | 'default' | 'spacious';

export interface SectionPrimitiveProps {
  title?: SectionText;
  subtitle?: SectionText;
  /** e.g. a "Ver todo" Button or a chevron IconButton. */
  action?: React.ReactNode;
  /** 'section' = small uppercase group label (e.g. "CUENTA"); 'screen' = full Title+subtitle screen header. Default 'section'. */
  size?: SectionHeaderSize;
  showDivider?: boolean;
  spacing?: SectionSpacing;
  children?: React.ReactNode;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}

const SPACING_GAP: Record<SectionSpacing, string> = { compact: '$2', default: '$3', spacious: '$5' };

function resolveText(t: (key: string, params?: Record<string, unknown>) => string, value?: SectionText): string | undefined {
  if (!value) return undefined;
  return 'i18nKey' in value ? t(value.i18nKey, value.i18nParams) : value.text;
}

export const SectionPrimitive = React.forwardRef<any, SectionPrimitiveProps>((props, ref) => {
  const { title, subtitle, action, size = 'section', showDivider = false, spacing = 'default', children, testID, accessibilityLabelI18nKey } = props;
  const { t } = useTranslation();

  const resolvedTitle = resolveText(t, title);
  const resolvedSubtitle = resolveText(t, subtitle);
  const resolvedAccessibilityLabel = accessibilityLabelI18nKey ? t(accessibilityLabelI18nKey) : resolvedTitle;

  const hasHeader = !!resolvedTitle || !!action;

  return (
    <YStack ref={ref as any} testID={testID} gap={SPACING_GAP[spacing] as any}>
      {hasHeader && (
        <XStack
          justifyContent="space-between"
          alignItems="center"
          accessible={!!resolvedAccessibilityLabel}
          {...toPlatformAccessibilityProps({ accessibilityLabel: resolvedAccessibilityLabel })}
        >
          <YStack flex={1} gap="$1">
            {resolvedTitle &&
              (size === 'screen' ? (
                <Title fontSize="$6" fontWeight="bold">
                  {resolvedTitle}
                </Title>
              ) : (
                <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
                  {resolvedTitle}
                </Body>
              ))}
            {resolvedSubtitle && (
              <Body tone="secondary" fontSize={size === 'screen' ? '$3' : '$2'}>
                {resolvedSubtitle}
              </Body>
            )}
          </YStack>
          {action}
        </XStack>
      )}
      {showDivider && <YStack height={1} backgroundColor="$divider" />}
      {children}
    </YStack>
  );
});

SectionPrimitive.displayName = 'SectionPrimitive';
