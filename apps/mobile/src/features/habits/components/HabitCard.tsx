import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, Circle } from 'tamagui';
import { Check, Flame, ChevronRight } from '@tamagui/lucide-icons';
import {
  Card, Body, useInteractionState, useInteractionAnimation, toPlatformAccessibilityProps,
} from '@commitment/design-system';
import { HabitSummary } from '@commitment/domain';
import { formatRecurrence } from '../utils/format-recurrence';
import { formatTime } from '@commitment/localization';

export interface HabitCardProps {
  habit: HabitSummary;
  onToggle: () => void;
  /** Opens the habit's detail — the whole card is this tap target, not just a chevron decoration. */
  onPress?: () => void;
}

/**
 * Habit list row — iteration 2 (2026-07-15), after the first pass still
 * read as an "administrative record" (goal caption + edit + postpone all
 * visible at once, no dominant action). Rebuilt around a single principle,
 * explicitly requested: a list exists to *execute* habits fast, everything
 * else belongs in the detail. This card shows exactly five things —
 * completion circle, name, recurrence/time, streak, a chevron — and has
 * exactly two tap targets: the circle (complete, stays on this screen) and
 * the rest of the card (opens the habit's detail, currently `/habits/[id]/edit`
 * which now also hosts Postpone/Archive/Goal-context — see that screen).
 *
 * The circle and the nav row are siblings, not nested — an earlier version
 * put the circle inside a `clickable` Card, which made both resolve to real
 * `<button>` elements on web (per TD-015's own fix) and produced an invalid
 * `<button>`-inside-`<button>` DOM (caught live via a React hydration-error
 * console message, same defect class as TD-015's own follow-up regression
 * #1 on `TodayAgendaWidget`). Card itself is non-interactive here; the two
 * real tap targets are its direct children.
 */
export function HabitCard({ habit, onToggle, onPress }: HabitCardProps) {
  const { t } = useTranslation('common');
  const { state, handlers } = useInteractionState({ disabled: !habit.enabled });
  const animationStyle = useInteractionAnimation(state);

  const [pulsing, setPulsing] = useState(false);
  const wasCompleted = useRef(habit.completedToday);
  useEffect(() => {
    if (!wasCompleted.current && habit.completedToday) {
      setPulsing(true);
      const timer = setTimeout(() => setPulsing(false), 260);
      wasCompleted.current = habit.completedToday;
      return () => clearTimeout(timer);
    }
    wasCompleted.current = habit.completedToday;
  }, [habit.completedToday]);

  const timeLabel = formatTime(new Date(2026, 0, 1, habit.reminderHour, habit.reminderMinute));
  const recurrenceLabel = formatRecurrence(t, habit.recurrence);

  return (
    <Card variant="elevated" padding="$4" opacity={habit.enabled ? 1 : 0.55}>
      <XStack gap="$4" alignItems="center">
        <Circle
          size={44}
          borderWidth={2}
          borderColor={habit.completedToday ? '$success' : '$divider'}
          backgroundColor={habit.completedToday ? '$success' : 'transparent'}
          justifyContent="center"
          alignItems="center"
          onPress={habit.enabled ? onToggle : undefined}
          onPressIn={habit.enabled ? handlers.onPressIn : undefined}
          onPressOut={habit.enabled ? handlers.onPressOut : undefined}
          scale={pulsing ? 1.12 : animationStyle.scale}
          cursor={habit.enabled ? 'pointer' : 'default'}
          {...({ animation: pulsing ? 'bouncy' : 'fast' } as any)}
          {...toPlatformAccessibilityProps({
            accessibilityRole: 'checkbox',
            accessibilityState: { checked: habit.completedToday, disabled: !habit.enabled },
            accessibilityLabel: t('habits.card.toggleA11y', { title: habit.title }),
          })}
        >
          {habit.completedToday && <Check size={20} color="$contentOnSemantic" />}
        </Circle>

        <XStack
          flex={1}
          minWidth={0}
          gap="$3"
          alignItems="center"
          onPress={onPress}
          cursor={onPress ? 'pointer' : 'default'}
          {...toPlatformAccessibilityProps({
            accessibilityRole: onPress ? 'button' : undefined,
            accessibilityLabel: onPress ? habit.title : undefined,
          })}
        >
          <YStack flex={1} minWidth={0} gap="$1">
            <Body
              fontWeight="600"
              numberOfLines={1}
              ellipsizeMode="tail"
              textDecorationLine={habit.completedToday ? 'line-through' : 'none'}
            >
              {habit.title}
            </Body>
            <Body tone="secondary" fontSize="$2" numberOfLines={1}>
              {recurrenceLabel} · {timeLabel}
            </Body>
          </YStack>

          {habit.currentStreakDays > 0 && (
            <XStack gap="$1" alignItems="center">
              <Flame size={14} color="$warning" />
              <Body fontSize="$3" fontWeight="700" color="$warning">
                {habit.currentStreakDays}
              </Body>
            </XStack>
          )}

          {onPress && <ChevronRight size={18} color="$contentTertiary" />}
        </XStack>
      </XStack>
    </Card>
  );
}
