import React from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, Circle } from 'tamagui';
import { Check } from '@tamagui/lucide-icons';
import { Body, toPlatformAccessibilityProps } from '@commitment/design-system';
import { formatWeekdayIndexShort, formatWeekdayIndexFull } from '@commitment/localization';

export interface WeekActivityFlagLike {
  readonly date: string;
  readonly completed: boolean;
  readonly isFuture: boolean;
}

export interface WeekActivityRowProps {
  flags: readonly WeekActivityFlagLike[];
}

/** "RACHA ACTUAL" — Mon-Sun app-wide activity streak (at least one task completed that day). Future days render neutral, never as "missed." */
export function WeekActivityRow({ flags }: WeekActivityRowProps) {
  const { t } = useTranslation('common');

  return (
    <XStack justifyContent="space-between" paddingHorizontal="$2">
      {flags.map((flag) => {
        const [y, m, d] = flag.date.split('-').map(Number);
        const date = new Date(y!, (m ?? 1) - 1, d);
        const bg = flag.completed ? '$success' : flag.isFuture ? '$surface' : '$surfaceRaised';
        const borderColor = flag.isFuture ? '$divider' : 'transparent';
        const weekdayFull = formatWeekdayIndexFull(date.getDay());
        const statusKey = flag.isFuture
          ? 'insights.overview.dayStatus.upcoming'
          : flag.completed
          ? 'insights.overview.dayStatus.completed'
          : 'insights.overview.dayStatus.missed';

        return (
          <YStack key={flag.date} alignItems="center" gap="$2">
            <Circle
              size={36}
              backgroundColor={bg as any}
              borderWidth={flag.isFuture ? 1 : 0}
              borderColor={borderColor as any}
              justifyContent="center"
              alignItems="center"
              {...toPlatformAccessibilityProps({
                accessibilityLabel: t(statusKey, { weekday: weekdayFull }),
              })}
            >
              {flag.completed && <Check color="$contentOnAccent" size={18} />}
            </Circle>
            <Body fontSize="$2" tone="secondary">{formatWeekdayIndexShort(date.getDay())}</Body>
          </YStack>
        );
      })}
    </XStack>
  );
}
