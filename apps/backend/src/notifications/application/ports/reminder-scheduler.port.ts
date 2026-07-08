export interface ReminderSchedulerPort {
  schedule(
    commitmentId: string,
    identityId: string,
    targetDateStr?: string,
    seriesId?: string,
    recurrencePattern?: string,
  ): Promise<void>;
  suspend(commitmentId: string): Promise<void>;
  reschedule(commitmentId: string, targetDateStr?: string): Promise<void>;
  cancel(commitmentId: string): Promise<void>;
}
