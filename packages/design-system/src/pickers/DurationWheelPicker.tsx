import { useMemo, useRef } from 'react';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Title } from '../components/typography/Title.js';
import { Label } from '../components/typography/Label.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PAD = (PICKER_HEIGHT - ROW_HEIGHT) / 2;

interface WheelColumnProps {
  value: number;
  range: number[];
  onChange: (value: number) => void;
  formatValue: (n: number) => string;
  accessibilityLabel: string;
  testID?: string;
}

/**
 * One scrolling, snap-to-row column — the building block `DurationWheelPicker`
 * composes two of (hours, minutes). Selection has two equally-real paths,
 * not one primary and one fallback: scroll-and-snap (`onMomentumScrollEnd`,
 * native momentum + `snapToInterval` on iOS/Android, CSS scroll-snap via
 * react-native-web on web) and tapping any visible row directly. Every row
 * is a real focusable/labeled control (`toPlatformAccessibilityProps` with
 * `accessibilityRole: 'button'`), so Tab+Enter works without a bespoke
 * "adjustable/spinbutton" ARIA implementation — same "route accessibility
 * through the one shared adapter" rule the rest of this Design System
 * already follows.
 */
function WheelColumn({ value, range, onChange, formatValue, accessibilityLabel, testID }: WheelColumnProps) {
  const scrollRef = useRef<any>(null);
  const initialIndex = Math.max(0, range.indexOf(value));

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo?.({ y: index * ROW_HEIGHT, animated: true });
  };

  const commitIndex = (index: number) => {
    const clamped = Math.min(range.length - 1, Math.max(0, index));
    const next = range[clamped];
    if (next !== undefined && next !== value) onChange(next);
  };

  const handleMomentumEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ROW_HEIGHT);
    scrollToIndex(Math.min(range.length - 1, Math.max(0, index)));
    commitIndex(index);
  };

  return (
    <YStack width={64} height={PICKER_HEIGHT} overflow="hidden" position="relative" testID={testID}>
      <YStack
        position="absolute"
        top={PAD}
        left={0}
        right={0}
        height={ROW_HEIGHT}
        backgroundColor="$focus"
        borderRadius="$3"
        pointerEvents="none"
      />
      <ScrollView
        ref={scrollRef}
        height={PICKER_HEIGHT}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD }}
        contentOffset={{ x: 0, y: initialIndex * ROW_HEIGHT }}
        onMomentumScrollEnd={handleMomentumEnd}
        {...toPlatformAccessibilityProps({ accessibilityLabel })}
      >
        {range.map((n, index) => {
          const isSelected = n === value;
          return (
            <YStack
              key={n}
              height={ROW_HEIGHT}
              alignItems="center"
              justifyContent="center"
              onPress={() => {
                scrollToIndex(index);
                commitIndex(index);
              }}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityLabel: formatValue(n),
                accessibilityState: { selected: isSelected },
              })}
            >
              <Title
                fontSize={isSelected ? '$8' : '$6'}
                fontWeight={isSelected ? 'bold' : '400'}
                color="$contentPrimary"
                opacity={isSelected ? 1 : 0.35}
              >
                {formatValue(n)}
              </Title>
            </YStack>
          );
        })}
      </ScrollView>
    </YStack>
  );
}

export interface DurationWheelPickerProps {
  hours: number;
  minutes: number;
  onChange: (value: { hours: number; minutes: number }) => void;
  /** Inclusive upper bound for the hours column. Default 5 — a generic duration picker, not a full 24h clock. */
  maxHours?: number;
  /** Minute increment. Default 5 (12 rows: 0, 5, 10 ... 55). */
  minuteStep?: number;
  /** Pre-resolved label text under each column (e.g. already run through the caller's own `t()`) — same pattern `MetricCard`'s `label` prop uses, since this primitive has no inherent domain vocabulary of its own to carry an i18nKey for. Defaults to universal abbreviations. */
  hoursLabel?: string;
  minutesLabel?: string;
  testID?: string;
}

/**
 * iOS Timer-style duration picker — two wheel columns (hours, minutes), no
 * chips, no text input, no "custom" mode, because the wheel already *is*
 * the custom mode. Built as a Design System primitive (not feature-local)
 * per explicit direction: Habits' Postpone is the first consumer, but
 * Tasks/notification-snooze/countdowns/focus-session timers are all named
 * future consumers of the same picker.
 */
export function DurationWheelPicker({
  hours,
  minutes,
  onChange,
  maxHours = 5,
  minuteStep = 5,
  hoursLabel = 'h',
  minutesLabel = 'min',
  testID,
}: DurationWheelPickerProps) {
  const hourRange = useMemo(() => Array.from({ length: maxHours + 1 }, (_, i) => i), [maxHours]);
  const minuteRange = useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep]
  );

  return (
    <XStack gap="$5" justifyContent="center" alignItems="center" testID={testID}>
      <YStack alignItems="center" gap="$2">
        <WheelColumn
          value={hours}
          range={hourRange}
          onChange={(h) => onChange({ hours: h, minutes })}
          formatValue={(n) => String(n)}
          accessibilityLabel={`${hoursLabel}: ${hours}`}
        />
        <Label color="$contentSecondary" fontSize="$2">{hoursLabel}</Label>
      </YStack>
      <YStack alignItems="center" gap="$2">
        <WheelColumn
          value={minutes}
          range={minuteRange}
          onChange={(m) => onChange({ hours, minutes: m })}
          formatValue={(n) => String(n).padStart(2, '0')}
          accessibilityLabel={`${minutesLabel}: ${minutes}`}
        />
        <Label color="$contentSecondary" fontSize="$2">{minutesLabel}</Label>
      </YStack>
    </XStack>
  );
}
