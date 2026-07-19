import { useState } from 'react';
import { useController, Control, FieldValues } from 'react-hook-form';
import { View } from 'tamagui';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, ChevronDown } from '@tamagui/lucide-icons';
import { SelectableField, Body, Label, Caption } from '@commitment/design-system';
import { dateFormatter } from '@/shared/lib/dateFormatter';
import {
  toNativeDateInputValue,
  toNativeTimeInputValue,
  fromNativeDateInputValue,
  fromNativeTimeInputValue,
} from '@/shared/lib/nativeDateTimeInput';

interface Props {
  name: string;
  control: Control<FieldValues>;
  /** @deprecated pass labelI18nKey instead so this component owns the t() call, not the Feature. */
  label?: string;
  /** @deprecated pass placeholderI18nKey instead. */
  placeholder?: string;
  labelI18nKey?: string;
  placeholderI18nKey?: string;
  disabled?: boolean;
  /** 'date' (default) or 'time' — reused by Habit's reminder-time field, which is otherwise identical. */
  mode?: 'date' | 'time';
}

/**
 * react-hook-form sibling of PlainDateTimePicker — see that file's doc
 * comment for why they're separate. Both delegate their visual/interaction
 * chrome to the shared `SelectableField` (`@commitment/design-system`) —
 * see the "Independent Date/Time Fields" design principle
 * (ENGINEERING_BOARD.md, 2026-07-19).
 */
export function ControlledDatePicker({
  name,
  control,
  label,
  placeholder,
  labelI18nKey,
  placeholderI18nKey,
  disabled,
  mode = 'date',
}: Props) {
  const { t } = useTranslation();
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control });

  const resolvedLabel = labelI18nKey ? t(labelI18nKey) : label;
  const resolvedPlaceholder = placeholderI18nKey ? t(placeholderI18nKey) : placeholder;
  const [show, setShow] = useState(false);
  const leadingIcon = mode === 'time' ? <Clock size={18} color="$contentSecondary" /> : <Calendar size={18} color="$contentSecondary" />;

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'set' && selectedDate) onChange(selectedDate);
  };

  const formatValue = (d: Date) => (mode === 'time' ? dateFormatter.formatTime(d) : dateFormatter.formatDate(d));

  // iOS's native display="default" is already a compact, native-styled,
  // tap-to-open control (not an always-expanded wheel), so it's left
  // unwrapped by SelectableField's own border/background rather than
  // nested inside a second layer of chrome; only the label above it is
  // shared, for typography consistency with every other field.
  if (Platform.OS === 'ios') {
    return (
      <View gap="$2" width="100%">
        {resolvedLabel && <Label color="$contentPrimary">{resolvedLabel}</Label>}
        <View flexDirection="row" alignItems="center" height={44}>
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="default"
            disabled={disabled}
            onChange={onDateChange}
            accessibilityLabel={resolvedLabel}
          />
        </View>
        {error && <Caption color="$danger">{error.message}</Caption>}
      </View>
    );
  }

  return (
    <View gap="$2" width="100%">
      <SelectableField
        label={resolvedLabel}
        leadingIcon={leadingIcon}
        trailingIcon={<ChevronDown size={16} color="$contentTertiary" />}
        disabled={disabled}
        error={!!error}
        onPress={Platform.OS === 'android' ? () => setShow(true) : undefined}
        accessibilityLabel={resolvedLabel}
      >
        <Body color={value ? '$contentPrimary' : '$contentTertiary'}>
          {value ? formatValue(value) : resolvedPlaceholder}
        </Body>

        {show && Platform.OS === 'android' && (
          <DateTimePicker value={value || new Date()} mode={mode} display="default" onChange={onDateChange} />
        )}

        {Platform.OS === 'web' && (
          <View position="absolute" top={0} left={0} right={0} bottom={0} opacity={0}>
            <input
              type={mode}
              value={value ? (mode === 'time' ? toNativeTimeInputValue(value) : toNativeDateInputValue(value)) : ''}
              disabled={disabled}
              aria-label={resolvedLabel}
              onChange={(e) => {
                const parsed = mode === 'time' ? fromNativeTimeInputValue(e.target.value) : fromNativeDateInputValue(e.target.value);
                if (parsed) onChange(parsed);
              }}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 'inherit',
              }}
            />
          </View>
        )}
      </SelectableField>
      {error && <Caption color="$danger">{error.message}</Caption>}
    </View>
  );
}
