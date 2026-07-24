import { useController, Control, FieldValues } from 'react-hook-form';
import { Select, Adapt, Sheet, YStack, Text } from 'tamagui';
import { toPlatformAccessibilityProps } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface Props {
  name: string;
  control: Control<FieldValues>;
  /** @deprecated pass labelI18nKey instead so this component owns the t() call, not the Feature. */
  label?: string;
  /** @deprecated pass placeholderI18nKey instead. */
  placeholder?: string;
  labelI18nKey?: string;
  placeholderI18nKey?: string;
  /** Each option needs exactly one of `labelKey` (translated) or `label` (pre-resolved plain text — e.g. dynamic content like a Goal's title, which isn't a translatable string). Same label-vs-i18nKey shape MetricCard/Badge already use. */
  options: { value: string; labelKey?: string; label?: string }[];
  disabled?: boolean;
  /** i18next namespace the option labelKeys live in — defaults to 'commitments' for backward compat. */
  ns?: string;
}

export function ControlledSelect({
  name,
  control,
  label,
  placeholder,
  labelI18nKey,
  placeholderI18nKey,
  options,
  disabled,
  ns = 'commitments',
}: Props) {
  const { t } = useTranslation();
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control });

  const resolvedLabel = labelI18nKey ? t(labelI18nKey, { ns }) : label;
  const resolvedPlaceholder = placeholderI18nKey ? t(placeholderI18nKey, { ns }) : placeholder;

  const resolveOptionLabel = (option: { labelKey?: string; label?: string }) =>
    option.label ?? (option.labelKey ? t(option.labelKey, { ns }) : '');

  const selectedLabel = useMemo(() => {
    const option = options.find((o) => o.value === value);
    return option ? resolveOptionLabel(option) : resolvedPlaceholder;
  }, [value, options, t, resolvedPlaceholder, ns]);

  return (
    <YStack gap="$2" width="100%">
      {resolvedLabel && <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{resolvedLabel}</Text>}

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
          {...toPlatformAccessibilityProps({
            accessibilityRole: 'button',
            accessibilityLabel: resolvedLabel,
          })}
        >
          <Select.Value placeholder={resolvedPlaceholder}>
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
              <Select.Label>{resolvedLabel}</Select.Label>
              {options.map((item, i) => (
                <Select.Item index={i} key={item.value} value={item.value}>
                  <Select.ItemText>{resolveOptionLabel(item)}</Select.ItemText>
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
