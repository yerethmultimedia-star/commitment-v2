import { useState } from 'react';
import { XStack } from 'tamagui';
import { Dialog, Button, Title, Input, Stack, Inline } from '@commitment/design-system';

export interface PostponeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (minutes: number) => void;
}

const PRESETS = [15, 30, 60, 180];

/** Snooze duration picker — presets confirmed with product (15m/30m/1h/3h) plus a custom entry. */
export function PostponeSheet({ open, onOpenChange, onConfirm }: PostponeSheetProps) {
  const [customMinutes, setCustomMinutes] = useState('');

  const handlePreset = (minutes: number) => {
    onConfirm(minutes);
    onOpenChange(false);
  };

  const handleCustom = () => {
    const parsed = parseInt(customMinutes, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    onConfirm(parsed);
    setCustomMinutes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Stack gap="$md">
        <Title i18nKey="habits.postpone.title" />

        <XStack gap="$2" flexWrap="wrap">
          {PRESETS.map((minutes) => (
            <Button
              key={minutes}
              variant="secondary"
              i18nKey={`habits.postpone.presets.${minutes}`}
              onPress={() => handlePreset(minutes)}
            />
          ))}
        </XStack>

        <XStack gap="$2" alignItems="center">
          <XStack flex={1}>
            <Input
              value={customMinutes}
              onChangeText={setCustomMinutes}
              placeholderI18nKey="habits.postpone.customPrompt"
              keyboardType="number-pad"
            />
          </XStack>
          <Button variant="secondary" i18nKey="habits.postpone.custom" onPress={handleCustom} />
        </XStack>

        <Inline gap="$md" justifyContent="flex-end">
          <Button variant="secondary" i18nKey="cancel" onPress={() => onOpenChange(false)} />
        </Inline>
      </Stack>
    </Dialog>
  );
}
