import { ReminderSourceType } from '@commitment/domain';

export interface ReminderSchedulerPort {
  schedule(
    sourceId: string,
    sourceType: ReminderSourceType,
    identityId: string,
    targetDateStr?: string,
    seriesId?: string,
    recurrencePattern?: string,
  ): Promise<void>;
  suspend(sourceId: string, sourceType: ReminderSourceType): Promise<void>;
  reschedule(
    sourceId: string,
    sourceType: ReminderSourceType,
    targetDateStr?: string,
  ): Promise<void>;
  cancel(sourceId: string, sourceType: ReminderSourceType): Promise<void>;
}
