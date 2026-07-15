import React from 'react';
import { XStack, YStack, View } from 'tamagui';
import { Body } from '@commitment/design-system';
import { FocusDayBar } from '../../engine/focus-detail';

const BAR_MAX_HEIGHT = 120;
// Reserved footer height for the weekday label row below each bar — bars
// bottom-align within the container, not at literal height=0, so the
// dashed average line's offset needs to account for this same footer,
// matching WeeklyActivityInsight's +40 container-height convention.
const FOOTER_HEIGHT = 40;

export interface FocusDayBarChartProps {
  days: readonly FocusDayBar[];
  averageMinutes: number;
}

/** Day-by-day focus-minutes bar chart with a dashed average line, reusing WeeklyActivityInsight's height-scaling technique. The average line is a plain dashed View border, not SVG — simpler than a hand-rolled dashed SVG line for a straight horizontal rule. */
export function FocusDayBarChart({ days, averageMinutes }: FocusDayBarChartProps) {
  const maxValue = Math.max(1, averageMinutes, ...days.map((d) => d.focusMinutes));
  const avgLineOffset = FOOTER_HEIGHT + (averageMinutes / maxValue) * BAR_MAX_HEIGHT;

  return (
    <View position="relative">
      {averageMinutes > 0 && (
        <View
          position="absolute"
          bottom={avgLineOffset}
          left={0}
          right={0}
          borderTopWidth={2}
          borderColor="$contentSecondary"
          style={{ borderStyle: 'dashed' }}
        />
      )}
      <XStack height={BAR_MAX_HEIGHT + FOOTER_HEIGHT} alignItems="flex-end" justifyContent="space-between" paddingHorizontal="$2">
        {days.map((day) => (
          <YStack key={day.date} alignItems="center" gap="$2" flex={1}>
            <Body fontSize="$2" fontWeight="bold" color="$contentSecondary">{day.focusMinutes}</Body>
            <View
              width={20}
              height={Math.max(4, (day.focusMinutes / maxValue) * BAR_MAX_HEIGHT)}
              backgroundColor="$interactive"
              borderRadius={4}
            />
            <Body fontSize="$2" tone="secondary">{day.weekdayLabel}</Body>
          </YStack>
        ))}
      </XStack>
    </View>
  );
}
