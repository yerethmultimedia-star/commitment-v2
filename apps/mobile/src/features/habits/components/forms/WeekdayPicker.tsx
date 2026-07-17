import { useController, Control, FieldValues } from 'react-hook-form';
import { Text, YStack, XStack, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { formatWeekdayIndexFull } from '@commitment/localization';
import { toPlatformAccessibilityProps } from '@commitment/design-system';

interface Props {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  disabled?: boolean;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sunday..Saturday, matching Date#getDay()

/** Multi-select day-of-week chip row, for Weekly/Biweekly recurrence — same selected-chip visual pattern as ObjectivesTab's status filter. */
export function WeekdayPicker({ name, control, label, disabled }: Props) {
  const { t } = useTranslation('common');
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control, defaultValue: [] });

  const selected: number[] = value ?? [];

  const toggleDay = (day: number) => {
    if (disabled) return;
    const next = selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day].sort((a, b) => a - b);
    onChange(next);
  };

  return (
    <YStack gap="$2" width="100%">
      {label && <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{label}</Text>}
      <XStack gap="$2" flexWrap="wrap">
        {DAYS.map((day) => {
          const isSelected = selected.includes(day);
          return (
            <Button
              key={day}
              size="$3"
              minWidth={44}
              minHeight={44}
              backgroundColor={isSelected ? '$accent' : '$surfaceRaised'}
              borderWidth={1}
              borderColor={isSelected ? '$accent' : '$divider'}
              color={isSelected ? '$contentOnAccent' : '$contentSecondary'}
              fontWeight={isSelected ? '700' : '500'}
              disabled={disabled}
              opacity={disabled ? 0.6 : 1}
              onPress={() => toggleDay(day)}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityState: { selected: isSelected, disabled },
                accessibilityLabel: formatWeekdayIndexFull(day),
              })}
            >
              {t(`habits.weekdayShort.${day}`)}
            </Button>
          );
        })}
      </XStack>
      {error && (
        <Text color="$danger" fontSize="$2">{error.message as string}</Text>
      )}
    </YStack>
  );
}
