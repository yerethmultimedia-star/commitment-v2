import { useState } from 'react';
import { useController, Control, FieldValues } from 'react-hook-form';
import { Text, YStack, XStack, Button } from 'tamagui';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { dateFormatter } from '@/shared/lib/dateFormatter';

interface Props {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** 'date' (default) or 'time' — reused by Habit's reminder-time field, which is otherwise identical. */
  mode?: 'date' | 'time';
}

export function ControlledDatePicker({ name, control, label, placeholder, disabled, mode = 'date' }: Props) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control });

  const [show, setShow] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatValue = (d: Date) => (mode === 'time' ? dateFormatter.formatTime(d) : dateFormatter.formatDate(d));

  return (
    <YStack gap="$2" width="100%">
      {label && <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{label}</Text>}

      {Platform.OS === 'ios' ? (
        <XStack alignItems="center" height={44}>
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="default"
            disabled={disabled}
            onChange={onDateChange}
            accessibilityLabel={label}
          />
        </XStack>
      ) : (
        <Button
          borderColor={error ? '$danger' : '$divider'}
          focusStyle={{ borderColor: error ? '$danger' : '$accent' }}
          disabled={disabled}
          opacity={disabled ? 0.6 : 1}
          onPress={() => setShow(true)}
          justifyContent="flex-start"
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text color={value ? '$contentPrimary' : '$contentTertiary'}>
            {value ? formatValue(value) : placeholder}
          </Text>
        </Button>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          onChange={onDateChange}
        />
      )}

      {error && (
        <Text color="$danger" fontSize="$2">{error.message}</Text>
      )}
    </YStack>
  );
}
