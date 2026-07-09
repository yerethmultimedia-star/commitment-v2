import { useController, Control, FieldValues } from 'react-hook-form';
import { Input, Text, YStack, InputProps } from 'tamagui';

interface Props extends InputProps {
  name: string;
  control: Control<FieldValues>;
  label?: string;
}

export function ControlledInput({ name, control, label, ...inputProps }: Props) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <YStack gap="$2" width="100%">
      {label && <Text color="$textSecondary" fontSize="$3" fontWeight="bold">{label}</Text>}
      <Input
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        borderColor={error ? '$red10' : '$borderColor'}
        focusStyle={{ borderColor: error ? '$red10' : '$blue10' }}
        {...inputProps}
      />
      {error && (
        <Text color="$red10" fontSize="$2">{error.message}</Text>
      )}
    </YStack>
  );
}
