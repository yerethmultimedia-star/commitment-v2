import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { BottomSheet, Title, Button, DurationWheelPicker } from '@commitment/design-system';

export interface PostponeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (minutes: number) => void;
}

const DEFAULT_HOURS = 0;
const DEFAULT_MINUTES = 30;

/**
 * Snooze duration picker — rebuilt 2026-07-15 around the Design System's
 * `DurationWheelPicker` (iOS Timer-inspired) after explicit user feedback
 * that the previous chip-grid + text-input + "Custom" button read as a
 * settings form, not "how long do you want to snooze this". The wheel is
 * the only input; there's no separate "custom" mode because scrolling the
 * wheel already covers every value in range. Domain logic unchanged —
 * still calls `onConfirm(totalMinutes)`, same as before.
 */
export function PostponeSheet({ open, onOpenChange, onConfirm }: PostponeSheetProps) {
  const { t } = useTranslation('common');
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);

  // Reset to the default duration each time the sheet opens, rather than
  // carrying over whatever was left scrolled from the last habit postponed.
  useEffect(() => {
    if (open) {
      setHours(DEFAULT_HOURS);
      setMinutes(DEFAULT_MINUTES);
    }
  }, [open]);

  const totalMinutes = hours * 60 + minutes;

  const handleConfirm = () => {
    if (totalMinutes <= 0) return;
    onConfirm(totalMinutes);
    onOpenChange(false);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <YStack gap="$5" alignItems="center" paddingVertical="$2">
        <Title i18nKey="habits.postpone.title" fontSize="$6" fontWeight="bold" />

        <DurationWheelPicker
          hours={hours}
          minutes={minutes}
          onChange={(value) => {
            setHours(value.hours);
            setMinutes(value.minutes);
          }}
          hoursLabel={t('habits.postpone.hoursLabel')}
          minutesLabel={t('habits.postpone.minutesLabel')}
        />

        <XStack gap="$3" width="100%">
          <YStack flex={1}>
            <Button variant="secondary" i18nKey="cancel" onPress={() => onOpenChange(false)} fullWidth />
          </YStack>
          <YStack flex={1}>
            <Button
              variant="primary"
              i18nKey="habits.postpone.confirm"
              onPress={handleConfirm}
              disabled={totalMinutes <= 0}
              fullWidth
            />
          </YStack>
        </XStack>
      </YStack>
    </BottomSheet>
  );
}
