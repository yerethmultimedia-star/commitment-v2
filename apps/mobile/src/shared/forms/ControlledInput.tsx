import { useController, Control, FieldValues } from 'react-hook-form';
import { Input, Text, YStack, InputProps } from 'tamagui';
import { toPlatformAccessibilityProps } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';

interface Props extends InputProps {
  name: string;
  control: Control<FieldValues>;
  /** @deprecated pass labelI18nKey instead so this component owns the t() call, not the Feature. */
  label?: string;
  labelI18nKey?: string;
  placeholderI18nKey?: string;
  accessibilityHintI18nKey?: string;
}

export function ControlledInput({
  name,
  control,
  label,
  labelI18nKey,
  placeholderI18nKey,
  accessibilityHintI18nKey,
  accessibilityLabel: rawAccessibilityLabel,
  accessibilityHint: rawAccessibilityHint,
  accessibilityRole: rawAccessibilityRole,
  accessibilityState: rawAccessibilityState,
  ...inputProps
}: Props) {
  const { t } = useTranslation();
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({ name, control });

  const resolvedLabel = labelI18nKey ? t(labelI18nKey) : label;
  const resolvedPlaceholder = placeholderI18nKey ? t(placeholderI18nKey) : inputProps.placeholder;
  const resolvedHint = accessibilityHintI18nKey ? t(accessibilityHintI18nKey) : rawAccessibilityHint;

  return (
    <YStack gap="$2" width="100%">
      {resolvedLabel && <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{resolvedLabel}</Text>}
      <Input
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        borderColor={error ? '$danger' : '$divider'}
        focusStyle={{ borderColor: error ? '$danger' : '$accent' }}
        {...inputProps}
        placeholder={resolvedPlaceholder}
        {...toPlatformAccessibilityProps({
          accessibilityLabel: resolvedLabel ?? rawAccessibilityLabel,
          accessibilityHint: resolvedHint,
          accessibilityRole: rawAccessibilityRole,
          accessibilityState: rawAccessibilityState,
        })}
      />
      {error && (
        <Text color="$danger" fontSize="$2">{error.message}</Text>
      )}
    </YStack>
  );
}
