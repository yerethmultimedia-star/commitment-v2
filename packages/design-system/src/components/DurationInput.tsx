import { useState } from 'react';
import { YStack } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Input } from './Input.js';
import { ChoiceGroup } from './ChoiceGroup.js';

const PRESET_MINUTES = [15, 30, 45, 60, 90, 120] as const;

type Choice = number | 'custom';
const CHOICES: readonly Choice[] = [...PRESET_MINUTES, 'custom'];

export interface DurationInputProps {
  /** Minutes, or null when unset. */
  value: number | null;
  onChange: (minutes: number | null) => void;
  /** Own i18n key, defaults to the shared `common:duration.label`. */
  labelI18nKey?: string;
  /** Floor for the custom numeric input — presets are never affected by this. Default 5. */
  min?: number;
  /** Ceiling for the custom numeric input — presets are never affected by this. Default 720 (12h). */
  max?: number;
}

/**
 * Preset-first duration picker — 15/30/45/60/90/120 minutes as one-tap
 * chips (most people think in blocks of time, not raw minutes), with a
 * "Custom…" option that reveals a numeric input for anything else.
 * Deliberately generic (not Task-specific): the same component is meant to
 * back Focus Sessions, durable Habits, Calendar blocks, and Coach estimates
 * later, per the Task Capability Completion epic's own recommendation —
 * one shared "how long" control instead of one per feature.
 */
export function DurationInput({ value, onChange, labelI18nKey, min = 5, max = 720 }: DurationInputProps) {
  const { t } = useTranslation();
  const isPreset = value !== null && (PRESET_MINUTES as readonly number[]).includes(value);
  const [customMode, setCustomMode] = useState(value !== null && !isPreset);

  const selectPreset = (minutes: number) => {
    setCustomMode(false);
    onChange(minutes);
  };

  const selectCustom = () => {
    setCustomMode(true);
    if (isPreset || value === null) onChange(null);
  };

  const onCustomChange = (text: string) => {
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(parsed)) {
      onChange(null);
      return;
    }
    onChange(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <YStack gap="$2" width="100%">
      <ChoiceGroup
        label={t(labelI18nKey ?? 'duration.label')}
        options={CHOICES}
        isSelected={(choice) => (choice === 'custom' ? customMode : !customMode && value === choice)}
        onSelect={(choice) => (choice === 'custom' ? selectCustom() : selectPreset(choice))}
        labelFor={(choice) => (choice === 'custom' ? t('duration.custom') : t(`duration.preset${choice}`))}
      />

      {customMode && (
        <Input
          value={value !== null ? String(value) : ''}
          onChangeText={onCustomChange}
          keyboardType="number-pad"
          labelI18nKey="duration.customLabel"
          placeholderI18nKey="duration.customPlaceholder"
        />
      )}
    </YStack>
  );
}
