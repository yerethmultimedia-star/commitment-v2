import React, { useEffect, useState } from 'react';
import { XStack, Button as TamaguiButton } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, Button, Title, Input, Stack, Inline, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useSession } from '@/core/auth/use-session';
import { queryKeys } from '@/core/query/query-keys';
import { useUiStore } from '@/core/store/use-ui-store';
import { goalsApi } from '@/features/goals/api/goals.api';
import { habitsApi } from '@/features/habits/api/habits.api';
import { notesApi } from '@/features/notes/api/notes.api';
import { tasksApi } from '@/features/tasks/api/tasks.api';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Commitment is intentionally not an option here — per VS-031 Product
// Experience Completion (Revision 2), Commitment is no longer exposed as a
// primary creation concept; it lives inside a Goal's workspace (Phase 5).
type CaptureType = 'goal' | 'habit' | 'task' | 'note';
const CAPTURE_TYPES: CaptureType[] = ['goal', 'habit', 'task', 'note'];

// Screens whose "+" only ever means one obvious type get that type
// pre-selected — e.g. Goals' FAB should never open on "Tarea" by default.
// Screens with no single obvious type (Today, Calendar, Coach, Tasks' own
// FAB already wants 'task') are intentionally left out, falling through to
// the 'task' default below.
const SOURCE_DEFAULT_TYPE: Partial<Record<string, CaptureType>> = {
  goals: 'goal',
};

export function QuickCaptureDialog({ open, onOpenChange }: QuickCaptureDialogProps) {
  const { t } = useTranslation();
  const { identityId } = useSession();
  const queryClient = useQueryClient();
  const source = useUiStore((s) => s.quickCaptureSource);
  const prefill = useUiStore((s) => s.quickCapturePrefill);
  const [type, setType] = useState<CaptureType>('task');
  const [text, setText] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  // Sync local state from the store each time the dialog opens: a prefill
  // (accepted Coach suggestion) wins outright; otherwise default the type to
  // whatever the triggering screen's "+" obviously means, per the map above.
  useEffect(() => {
    if (!open) return;
    if (prefill) {
      setType(prefill.type);
      setText(prefill.text);
    } else {
      setType(SOURCE_DEFAULT_TYPE[source ?? ''] ?? 'task');
    }
  }, [open, prefill, source]);

  const handleCapture = async () => {
    const trimmed = text.trim();
    if (!trimmed || !identityId) return;

    setIsCapturing(true);
    try {
      if (type === 'goal') {
        await goalsApi.create({ title: trimmed });
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      } else if (type === 'habit') {
        // Sensible defaults for a bare quick-captured habit (Daily, 9:00 AM) — fully editable afterward.
        await habitsApi.create({
          id: generateId(),
          identityId,
          title: trimmed,
          recurrenceType: 'Daily',
          reminderHour: 9,
          reminderMinute: 0,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } else if (type === 'note') {
        await notesApi.create({ text: trimmed });
      } else {
        await tasksApi.create({ id: generateId(), identityId, title: trimmed });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      setText('');
      onOpenChange(false);
    } catch (err) {
      console.error('Quick capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Stack gap="$md">
        <Title i18nKey="quickCapture.title" />

        <XStack gap="$2" flexWrap="wrap">
          {CAPTURE_TYPES.map((option) => (
            <TamaguiButton
              key={option}
              size="$3"
              theme={type === option ? 'active' : undefined}
              disabled={isCapturing}
              onPress={() => setType(option)}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityState: { selected: type === option },
              })}
              aria-pressed={type === option}
            >
              {t(`quickCapture.types.${option}`)}
            </TamaguiButton>
          ))}
        </XStack>

        <Input
          value={text}
          onChangeText={setText}
          placeholderI18nKey={`quickCapture.placeholders.${type}`}
          accessibilityLabelI18nKey={`quickCapture.placeholders.${type}`}
          onFocus={() => {}}
          onBlur={() => {}}
          disabled={isCapturing}
        />

        <Inline gap="$md" justifyContent="flex-end">
          <Button
            variant="secondary"
            i18nKey="quickCapture.btnCancel"
            onPress={() => onOpenChange(false)}
            disabled={isCapturing}
          />
          <Button
            variant="primary"
            i18nKey="quickCapture.btnCapture"
            onPress={handleCapture}
            disabled={!text.trim() || isCapturing}
            loading={isCapturing}
          />
        </Inline>
      </Stack>
    </Dialog>
  );
}
