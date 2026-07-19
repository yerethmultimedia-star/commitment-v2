import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, Button, Title, Input, Stack, Inline } from '@commitment/design-system';
import { useSession } from '@/core/auth/use-session';
import { queryKeys } from '@/core/query/query-keys';
import { useUiStore } from '@/core/store/use-ui-store';
import { goalsApi } from '@/features/goals/api/goals.api';
import { habitsApi } from '@/features/habits/api/habits.api';
import { notesApi } from '@/features/notes/api/notes.api';
import { tasksApi } from '@/features/tasks/api/tasks.api';
import { commitmentsApi } from '@/features/commitments/api/commitments.api';

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

// Every first-level domain entity is eligible for Quick Capture (ADR-020,
// "Quick Capture Philosophy") — the default is inclusion, not exclusion.
// Commitment joined 2026-07-17; previously excluded per a VS-031 assumption
// ("it lives inside a Goal's workspace") that ADR-019 superseded.
type CaptureType = 'goal' | 'commitment' | 'habit' | 'task' | 'note';

// Sprint de Estabilización, Fase 3 (Quick Action Menu): the type is now
// always chosen before this dialog opens — QuickActionMenu.tsx (a user pick)
// or an accepted Coach suggestion both call openQuickCaptureWithPrefill()
// with an explicit type. This dialog no longer has its own type-selector row
// or a SOURCE_DEFAULT_TYPE fallback — both are now dead paths by
// construction (isQuickCaptureOpen only ever becomes true via that one
// call), not just unused. Still exactly one capture mechanism underneath
// (ADR-020's Universal Capture, minimal title-only) — only the type-choosing
// UI moved out to the menu.
export function QuickCaptureDialog({ open, onOpenChange }: QuickCaptureDialogProps) {
  const { identityId } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const prefill = useUiStore((s) => s.quickCapturePrefill);
  const [type, setType] = useState<CaptureType>('task');
  const [text, setText] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!open || !prefill) return;
    setType(prefill.type);
    setText(prefill.text);
  }, [open, prefill]);

  const handleCapture = async () => {
    const trimmed = text.trim();
    if (!trimmed || !identityId) return;

    setIsCapturing(true);
    try {
      // Product Decision "Capture vs Authoring" (2026-07-19): Quick Capture
      // stays minimal (ADR-020) — this only decides where the app lands
      // afterward. Goal/Commitment/Habit already have a Detail or Workspace
      // screen, so we route there. Task/Note don't have one yet (no
      // ADR authorizes building it this sprint), so they keep the old
      // behavior of just closing the dialog.
      let destination: string | null = null;
      if (type === 'goal') {
        const id = generateId();
        await goalsApi.create({ id, identityId, title: trimmed });
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
        destination = `/goals/${id}`;
      } else if (type === 'commitment') {
        // Minimal capture, same principle as every other type here (ADR-020):
        // title only, no Goal picker in this dialog. Born unassociated if no
        // Goal can be inferred — same pattern Task/Habit already follow.
        const id = generateId();
        await commitmentsApi.create({ id, identityId, title: trimmed });
        queryClient.invalidateQueries({ queryKey: queryKeys.commitments.list() });
        destination = `/commitments/${id}`;
      } else if (type === 'habit') {
        // Sensible defaults for a bare quick-captured habit (Daily, 9:00 AM) — fully editable afterward.
        const id = generateId();
        await habitsApi.create({
          id,
          identityId,
          title: trimmed,
          recurrenceType: 'Daily',
          reminderHour: 9,
          reminderMinute: 0,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        destination = `/habits/${id}`;
      } else if (type === 'note') {
        await notesApi.create({ text: trimmed });
      } else {
        await tasksApi.create({ id: generateId(), identityId, title: trimmed });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      setText('');
      onOpenChange(false);
      if (destination) {
        router.push(destination as any);
      }
    } catch (err) {
      console.error('Quick capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Stack gap="$md">
        <Title i18nKey={`quickCapture.creating.${type}`} />

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
