import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/core/storage/secure-storage';
import { ReminderEntityKind, ReminderSettings } from './reminder.types';

function keyFor(kind: ReminderEntityKind, entityId: string): string {
  return `${kind}:${entityId}`;
}

interface ReminderStoreState {
  settingsByKey: Record<string, ReminderSettings>;
  setReminder: (kind: ReminderEntityKind, entityId: string, settings: ReminderSettings) => void;
  clearReminder: (kind: ReminderEntityKind, entityId: string) => void;
}

/**
 * Client-side-only persistence for reminder settings, scoped per
 * (entityKind, entityId). Deliberately NOT routed through any *.api.ts —
 * the real backend has no Task/Goal reminder endpoint yet (only Habit and
 * Commitment, see reminder.types.ts), and sending unknown fields to it
 * would either be silently dropped or rejected depending on the endpoint's
 * DTO validation. This store is the "UI foundation" the Stabilization
 * Sprint round asked for: fully functional locally, trivial to swap for a
 * real API call per entity kind once the backend engine is extended.
 */
export const useReminderStore = create<ReminderStoreState>()(
  persist(
    (set) => ({
      settingsByKey: {},
      setReminder: (kind, entityId, settings) =>
        set((state) => ({
          settingsByKey: { ...state.settingsByKey, [keyFor(kind, entityId)]: settings },
        })),
      clearReminder: (kind, entityId) =>
        set((state) => {
          const next = { ...state.settingsByKey };
          delete next[keyFor(kind, entityId)];
          return { settingsByKey: next };
        }),
    }),
    {
      name: 'commitment-reminders-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

export function useEntityReminder(kind: ReminderEntityKind, entityId: string | undefined) {
  const settings = useReminderStore((s) => (entityId ? s.settingsByKey[keyFor(kind, entityId)] : undefined));
  const setReminder = useReminderStore((s) => s.setReminder);
  const clearReminder = useReminderStore((s) => s.clearReminder);
  return {
    settings,
    setReminder: (next: ReminderSettings) => entityId && setReminder(kind, entityId, next),
    clearReminder: () => entityId && clearReminder(kind, entityId),
  };
}
