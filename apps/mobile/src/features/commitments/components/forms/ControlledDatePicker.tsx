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
}

export function ControlledDatePicker({ name, control, label, placeholder }: Props) {
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
            onChange={onDateChange}
          />
        </XStack>
      ) : (
        <Button 
          variant="outlined" 
          justifyContent="flex-start" 
          borderColor={error ? '$red10' : '$borderColor'}
          onPress={() => setShow(true)}
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
