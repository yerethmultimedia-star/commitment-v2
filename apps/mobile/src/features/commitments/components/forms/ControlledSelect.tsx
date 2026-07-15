import { useController, Control, FieldValues } from 'react-hook-form';
import { Select, Adapt, Sheet, YStack, Text } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface Props {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  placeholder?: string;
  options: { value: string; labelKey: string }[];
  disabled?: boolean;
  /** i18next namespace the option labelKeys live in — defaults to 'commitments' for backward compat. */
  ns?: string;
}

export function ControlledSelect({ name, control, label, placeholder, options, disabled, ns = 'commitments' }: Props) {
  const { t } = useTranslation();
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control });

  const selectedLabel = useMemo(() => {
    const option = options.find((o) => o.value === value);
    return option ? t(option.labelKey, { ns }) : placeholder;
  }, [value, options, t, placeholder, ns]);

  return (
    <YStack gap="$2" width="100%">
      {label && <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{label}</Text>}

      <Select
        value={value}
        onValueChange={onChange}
        disablePreventBodyScroll
      >
        <Select.Trigger
          iconAfter={null}
          borderColor={error ? '$danger' : '$divider'}
          focusStyle={{ borderColor: error ? '$danger' : '$accent' }}
          disabled={disabled}
          opacity={disabled ? 0.6 : 1}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Select.Value placeholder={placeholder}>
            {selectedLabel}
          </Select.Value>
        </Select.Trigger>

        <Adapt platform="touch">
          <Sheet modal dismissOnSnapToBottom>
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay />
          </Sheet>
        </Adapt>

        <Select.Content>
          <Select.Viewport minWidth={200}>
            <Select.Group>
              <Select.Label>{label}</Select.Label>
              {options.map((item, i) => (
                <Select.Item index={i} key={item.value} value={item.value}>
                  <Select.ItemText>{t(item.labelKey, { ns })}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>

      {error && (
        <Text color="$danger" fontSize="$2">{error.message}</Text>
      )}
    </YStack>
  );
}
