import { useState } from 'react';
import { View } from 'tamagui';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { Calendar, Clock, ChevronDown } from '@tamagui/lucide-icons';
import { SelectableField, Body, Label } from '@commitment/design-system';
import { dateFormatter } from '@/shared/lib/dateFormatter';
import {
  toNativeDateInputValue,
  toNativeTimeInputValue,
  fromNativeDateInputValue,
  fromNativeTimeInputValue,
} from '@/shared/lib/nativeDateTimeInput';

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
  labelI18nKey?: string;
  label?: string;
  placeholderI18nKey?: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * 'date' or 'time' only — never a combined 'datetime'. App-wide UX rule:
   * date and time are always two independent, separately-editable fields,
   * never one combined picker. Combine two of these plus mergeDateAndTime()
   * at the call site, mirroring ReminderSection.tsx's custom-reminder
   * date/time pair.
   */
  mode?: 'date' | 'time';
}

/**
 * Same picker UI as ControlledDatePicker, minus the react-hook-form
 * dependency — for forms still on plain useState (e.g. TaskForm, pending
 * the Fase 2.6 form-system migration). Duplicated rather than shared
 * because ControlledDatePicker's `useController` call isn't optional; the
 * two will converge once TaskForm moves to react-hook-form. Both delegate
 * their visual/interaction chrome to the shared `SelectableField`
 * (`@commitment/design-system`) — see the "Independent Date/Time Fields"
 * design principle (ENGINEERING_BOARD.md, 2026-07-19): fields that open a
 * selector must look and behave like any other editable field, not a
 * static label, and that fix must live in one reusable place, not be
 * patched screen by screen.
 */
export function PlainDateTimePicker({
  value,
  onChange,
  labelI18nKey,
  label,
  placeholderI18nKey,
  placeholder,
  disabled,
  mode = 'date',
}: Props) {
  const resolvedLabel = label ?? labelI18nKey;
  const resolvedPlaceholder = placeholder ?? placeholderI18nKey;
  const [show, setShow] = useState(false);
  const leadingIcon = mode === 'time' ? <Clock size={18} color="$contentSecondary" /> : <Calendar size={18} color="$contentSecondary" />;

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'set' && selectedDate) onChange(selectedDate);
  };

  const formatValue = (d: Date) => (mode === 'time' ? dateFormatter.formatTime(d) : dateFormatter.formatDate(d));

  // iOS's native display="default" is already a compact, native-styled,
  // tap-to-open control (not an always-expanded wheel — that's "spinner"),
  // so it's left unwrapped by SelectableField's own border/background
  // rather than nested inside a second layer of chrome; only the label
  // above it is shared, for typography consistency with every other field.
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
      </View>
    );
  }

  return (
    <SelectableField
      label={resolvedLabel}
      leadingIcon={leadingIcon}
      trailingIcon={<ChevronDown size={16} color="$contentTertiary" />}
      disabled={disabled}
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
          {/* Real native HTML date/time input — @react-native-community/datetimepicker
              has no web implementation at all (TECH_DEBT.md Item 43, now resolved
              this way rather than left as a dead button). Fully transparent but
              interactive: clicking anywhere on the row opens the browser's own
              native date/time picker; the visible text above shows the app's own
              locale-formatted value instead of the input's native rendering. */}
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
  );
}
