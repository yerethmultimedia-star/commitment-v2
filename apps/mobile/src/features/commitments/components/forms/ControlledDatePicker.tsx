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
}

export function ControlledDatePicker({ name, control, label, placeholder, disabled }: Props) {
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

  return (
    <YStack gap="$2" width="100%">
      {label && <Text color="$textSecondary" fontSize="$3" fontWeight="bold">{label}</Text>}
      
      {Platform.OS === 'ios' ? (
        <XStack alignItems="center" height={44}>
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            disabled={disabled}
            onChange={onDateChange}
          />
        </XStack>
      ) : (
        <Button 
          theme={error ? 'red' : undefined}
          borderColor={error ? '$red10' : '$borderColor'}
          focusStyle={{ borderColor: error ? '$red10' : '$blue10' }}
          disabled={disabled}
          opacity={disabled ? 0.6 : 1}
          onPress={() => setShow(true)}
          justifyContent="flex-start"
        >
          <Text color={value ? '$text' : '$gray10'}>
            {value ? dateFormatter.formatDate(value) : placeholder}
          </Text>
        </Button>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {error && (
        <Text color="$red10" fontSize="$2">{error.message}</Text>
      )}
    </YStack>
  );
}
