import React from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, View } from 'tamagui';
import { Body, toPlatformAccessibilityProps } from '@commitment/design-system';
import { FocusDayBar } from '../../engine/focus-detail';

const BAR_MAX_HEIGHT = 180;
// Reserved footer height for the weekday label row below each bar — bars
// bottom-align within the container, not at literal height=0, so the
// dashed average line's offset needs to account for this same footer,
// matching WeeklyActivityInsight's +40 container-height convention.
const FOOTER_HEIGHT = 40;
const Y_AXIS_WIDTH = 28;

/** Rounds up to a "nice" gridline step — 20 up to 200min, 50 up to 500, 100 beyond. Chart is protagonist (Sprint de Estabilización, Fase 2.5) — real tick marks, not just numbers floating over bars. */
function niceStep(max: number): number {
  if (max <= 200) return 20;
  if (max <= 500) return 50;
  return 100;
}

export interface FocusDayBarChartProps {
  days: readonly FocusDayBar[];
  averageMinutes: number;
}

/** Day-by-day focus-minutes bar chart with a Y-axis, discrete gridlines, and a thin average line — the chart is the screen's protagonist, not a supporting visual (Sprint de Estabilización, Fase 2.5 decision). Bars animate in via the theme's existing `cardEntrance` transition preset. */
export function FocusDayBarChart({ days, averageMinutes }: FocusDayBarChartProps) {
  const { t } = useTranslation('common');
  const step = niceStep(Math.max(1, averageMinutes, ...days.map((d) => d.focusMinutes)));
  const rawMax = Math.max(1, averageMinutes, ...days.map((d) => d.focusMinutes));
  const niceMax = Math.max(step, Math.ceil(rawMax / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax; v += step) ticks.push(v);
  ticks.reverse(); // top-to-bottom for rendering

  const avgLineOffset = FOOTER_HEIGHT + (averageMinutes / niceMax) * BAR_MAX_HEIGHT;

  return (
    <XStack gap="$2">
      {/* Y-axis */}
      <YStack width={Y_AXIS_WIDTH} height={BAR_MAX_HEIGHT + FOOTER_HEIGHT} justifyContent="space-between" paddingBottom={FOOTER_HEIGHT}>
        {ticks.map((tick) => (
          <Body key={tick} fontSize="$1" tone="secondary" textAlign="right">{tick}</Body>
        ))}
      </YStack>

      <View position="relative" flex={1}>
        {/* Gridlines, one per tick, plain and quiet — support the chart, don't compete with it */}
        {ticks.map((tick) => (
          <View
            key={tick}
            position="absolute"
            bottom={FOOTER_HEIGHT + (tick / niceMax) * BAR_MAX_HEIGHT}
            left={0}
            right={0}
            borderTopWidth={1}
            borderColor="$divider"
            opacity={0.5}
          />
        ))}

        {/* Average line — deliberately quiet (1px, secondary tone, partial
            opacity): a reading aid, not a second data series competing with
            the bars themselves. */}
        {averageMinutes > 0 && (
          <View
            position="absolute"
            bottom={avgLineOffset}
            left={0}
            right={0}
            borderTopWidth={1}
            borderColor="$contentSecondary"
            opacity={0.6}
            style={{ borderStyle: 'dashed' }}
            enterStyle={{ opacity: 0 }}
            transition="cardEntrance"
          />
        )}

        <XStack height={BAR_MAX_HEIGHT + FOOTER_HEIGHT} alignItems="flex-end" justifyContent="space-between" paddingHorizontal="$2">
          {days.map((day) => (
            <YStack
              key={day.date}
              alignItems="center"
              gap="$2"
              flex={1}
              accessible
              {...toPlatformAccessibilityProps({
                accessibilityLabel: `${day.weekdayLabel}: ${t('insights.focus.minutesLabel', { count: day.focusMinutes })}`,
              })}
            >
              <Body fontSize="$2" fontWeight="bold" color="$contentSecondary">{day.focusMinutes}</Body>
              <View
                width={24}
                height={Math.max(4, (day.focusMinutes / niceMax) * BAR_MAX_HEIGHT)}
                backgroundColor="$interactive"
                borderRadius={4}
                enterStyle={{ height: 0, opacity: 0 }}
                transition="cardEntrance"
              />
              <Body fontSize="$2" tone="secondary">{day.weekdayLabel}</Body>
            </YStack>
          ))}
        </XStack>
      </View>
    </XStack>
  );
}
