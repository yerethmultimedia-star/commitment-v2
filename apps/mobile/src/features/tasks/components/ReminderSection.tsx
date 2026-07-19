import { Text, YStack, XStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Switch, ChoiceGroup } from '@commitment/design-system';
import { dateFormatter } from '@/shared/lib/dateFormatter';
import { PlainDateTimePicker } from '@/shared/forms/PlainDateTimePicker';
import { mergeDateAndTime } from '@/shared/lib/mergeDateAndTime';
import {
  ReminderSettings,
  ReminderPreset,
  ReminderRepeat,
  ReminderStopCondition,
  resolveReminderDateTime,
} from '@/core/reminders/reminder.types';

const PRESETS: ReminderPreset[] = ['atDueDate', '5min', '15min', '30min', '1hour', '1day', 'custom'];
const REPEATS: ReminderRepeat[] = ['never', '15min', 'hourly', 'daily'];
const STOP_CONDITIONS: ReminderStopCondition[] = ['onCompleted', 'afterDueDate'];

export function ReminderSection({
  value,
  onChange,
  dueDate,
}: {
  value: ReminderSettings;
  onChange: (next: ReminderSettings) => void;
  /** The task's own due date, if any — presets other than 'custom' are computed relative to this. */
  dueDate: Date | null;
}) {
  const { t } = useTranslation('tasks');

  const presetLabel = (p: ReminderPreset) =>
    t(`reminders.preset${p.charAt(0).toUpperCase()}${p.slice(1)}`);
  const repeatLabel = (r: ReminderRepeat) =>
    t(`reminders.repeat${r.charAt(0).toUpperCase()}${r.slice(1)}`);
  const stopLabel = (s: ReminderStopCondition) =>
    t(`reminders.stop${s.charAt(0).toUpperCase()}${s.slice(1)}`);

  const previewDate = resolveReminderDateTime(value, dueDate);
  const customDate = value.customDateTime ? new Date(value.customDateTime) : null;

  return (
    <YStack gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">
          {t('reminders.title')}
        </Text>
        <Switch
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ ...value, enabled })}
          labelI18nKey="tasks:reminders.enable"
        />
      </XStack>

      {value.enabled && (
        <YStack gap="$3" paddingLeft="$1">
          <YStack gap="$1">
            <ChoiceGroup
              label={t('reminders.preset')}
              options={PRESETS}
              isSelected={(preset) => value.preset === preset}
              onSelect={(preset) => onChange({ ...value, preset })}
              labelFor={presetLabel}
              isDisabled={(preset) => !dueDate && preset !== 'custom'}
            />
            {!dueDate && value.preset !== 'custom' && (
              <Text color="$contentTertiary" fontSize="$2">{t('reminders.needsDueDateHint')}</Text>
            )}
          </YStack>

          {value.preset === 'custom' && (
            <YStack gap="$2">
              <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{t('reminders.customDateTime')}</Text>
              <XStack gap="$2">
                <XStack flex={1}>
                  <PlainDateTimePicker
                    value={customDate}
                    onChange={(date) => onChange({ ...value, customDateTime: mergeDateAndTime(customDate, date, 'date').toISOString() })}
                    mode="date"
                  />
                </XStack>
                <XStack flex={1}>
                  <PlainDateTimePicker
                    value={customDate}
                    onChange={(date) => onChange({ ...value, customDateTime: mergeDateAndTime(customDate, date, 'time').toISOString() })}
                    mode="time"
                  />
                </XStack>
              </XStack>
            </YStack>
          )}

          <ChoiceGroup
            label={t('reminders.repeat')}
            options={REPEATS}
            isSelected={(repeat) => value.repeat === repeat}
            onSelect={(repeat) => onChange({ ...value, repeat })}
            labelFor={repeatLabel}
          />

          <ChoiceGroup
            label={t('reminders.stopCondition')}
            options={STOP_CONDITIONS}
            isSelected={(stopCondition) => value.stopCondition === stopCondition}
            onSelect={(stopCondition) => onChange({ ...value, stopCondition })}
            labelFor={stopLabel}
          />

          <Text color="$contentTertiary" fontSize="$2" fontStyle="italic">
            {previewDate
              ? t('reminders.preview', { date: `${dateFormatter.formatDate(previewDate)} ${dateFormatter.formatTime(previewDate)}` })
              : t('reminders.previewNone')}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
