import React from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, Button as TamaguiButton, ScrollView } from 'tamagui';
import { toPlatformAccessibilityProps } from '@commitment/design-system';

export type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export interface TimeRangeTabsProps {
  activeRange: TimeRange;
  enabledRanges: readonly TimeRange[];
  onChange: (range: TimeRange) => void;
}

const RANGES: TimeRange[] = ['week', 'month', 'quarter', 'year'];

/**
 * Mirrors ObjectivesTab.tsx's selected/unselected chip styling exactly (raw
 * Tamagui Button, not the design-system Button — that component only has a
 * variant/tone axis, no "selected" concept, so it doesn't fit this pattern).
 * Month/Quarter/Year are visibly present but disabled ("coming soon").
 */
export function TimeRangeTabs({ activeRange, enabledRanges, onChange }: TimeRangeTabsProps) {
  const { t } = useTranslation('common');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$2">
        {RANGES.map((range) => {
          const selected = range === activeRange;
          const enabled = enabledRanges.includes(range);

          return (
            <TamaguiButton
              key={range}
              size="$3"
              backgroundColor={selected ? '$accent' : '$surfaceRaised'}
              borderWidth={1}
              borderColor={selected ? '$accent' : '$divider'}
              color={selected ? '$contentOnAccent' : '$contentSecondary'}
              fontWeight={selected ? '700' : '500'}
              opacity={enabled ? 1 : 0.6}
              disabled={!enabled}
              pressStyle={enabled ? { opacity: 0.85 } : undefined}
              onPress={enabled ? () => onChange(range) : undefined}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityState: { selected, disabled: !enabled },
              })}
            >
              {t(`insights.overview.range.${range}`)}
              {!enabled ? ` (${t('insights.overview.range.comingSoon')})` : ''}
            </TamaguiButton>
          );
        })}
      </XStack>
    </ScrollView>
  );
}
