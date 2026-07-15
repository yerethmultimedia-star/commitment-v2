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
      {label && <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{label}</Text>}
      <Input
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        borderColor={error ? '$danger' : '$divider'}
        focusStyle={{ borderColor: error ? '$danger' : '$accent' }}
        accessibilityLabel={label}
        {...inputProps}
      />
      {error && (
        <Text color="$danger" fontSize="$2">{error.message}</Text>
      )}
    </YStack>
  );
}
