export interface ReminderSchedulerPort {
  schedule(commitmentId: string): Promise<void>;
  suspend(commitmentId: string): Promise<void>;
  reschedule(commitmentId: string): Promise<void>;
  cancel(commitmentId: string): Promise<void>;
}
