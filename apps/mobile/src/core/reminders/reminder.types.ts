/**
 * Client-side reminder settings shape — entity-agnostic by design.
 *
 * This mirrors the shape the backend's REAL reminder engine already expects
 * (see apps/backend/src/notifications: Reminder aggregate, ReminderSourceType,
 * ReminderSchedulerPort). That engine currently only knows `sourceType:
 * 'commitment' | 'habit'` — it does not yet know about Task, and wiring it up
 * is a domain change (new ReminderSourceType, a TaskReminderSchedulingService,
 * new event handlers) explicitly out of scope for this Stabilization Sprint
 * round. This module is the client-side UI foundation only: it captures the
 * user's intent in a shape that maps 1:1 onto that backend engine's inputs,
 * so wiring Task (or any future entity) in later is a translation exercise,
 * not a redesign. See docs/03-architecture/reminder_engine_extension.md.
 */

/** What every EntityKind eventually funnels into ReminderSourceType server-side (today: 'habit' | 'commitment' only). */
export type ReminderEntityKind = 'task' | 'habit' | 'commitment' | 'goal';

/** Offset from the entity's own due/target date — 'custom' switches to an explicit date+time instead. */
export type ReminderPreset = 'atDueDate' | '5min' | '15min' | '30min' | '1hour' | '1day' | 'custom';

/** Maps onto ReminderSchedulerPort.schedule()'s existing (currently unused by Habit) `recurrencePattern` parameter. */
export type ReminderRepeat = 'never' | '15min' | 'hourly' | 'daily';

/** Determines which lifecycle event should call ReminderSchedulerPort.cancel()/suspend() once wired server-side. */
export type ReminderStopCondition = 'onCompleted' | 'afterDueDate';

export interface ReminderSettings {
  enabled: boolean;
  preset: ReminderPreset;
  /** ISO datetime — only meaningful when preset === 'custom'. */
  customDateTime: string | null;
  repeat: ReminderRepeat;
  stopCondition: ReminderStopCondition;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  preset: 'atDueDate',
  customDateTime: null,
  repeat: 'never',
  stopCondition: 'onCompleted',
};

const PRESET_OFFSET_MINUTES: Record<Exclude<ReminderPreset, 'custom'>, number> = {
  atDueDate: 0,
  '5min': 5,
  '15min': 15,
  '30min': 30,
  '1hour': 60,
  '1day': 60 * 24,
};

/**
 * Resolves a ReminderSettings + the entity's own due date into a concrete
 * fire time — the same computation a future TaskReminderSchedulingService
 * would do server-side before calling ReminderSchedulerPort.schedule().
 * Kept here too so the UI can show "se enviará el 20 de julio a las 08:45"
 * style previews without waiting on that backend work.
 */
export function resolveReminderDateTime(settings: ReminderSettings, dueDate: Date | null): Date | null {
  if (!settings.enabled) return null;
  if (settings.preset === 'custom') {
    return settings.customDateTime ? new Date(settings.customDateTime) : null;
  }
  if (!dueDate) return null;
  const offsetMinutes = PRESET_OFFSET_MINUTES[settings.preset];
  return new Date(dueDate.getTime() - offsetMinutes * 60_000);
}
