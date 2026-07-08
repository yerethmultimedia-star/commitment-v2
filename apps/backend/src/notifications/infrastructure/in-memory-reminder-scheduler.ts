import { ReminderSchedulerPort } from '../application/ports/reminder-scheduler.port';

export class InMemoryReminderScheduler implements ReminderSchedulerPort {
  private readonly scheduled = new Set<string>();
  private readonly suspended = new Set<string>();

  public schedule(commitmentId: string): Promise<void> {
    this.scheduled.add(commitmentId);
    this.suspended.delete(commitmentId);
    console.log(
      `[InMemoryReminderScheduler] Scheduled reminder for ${commitmentId}`,
    );
    return Promise.resolve();
  }

  public suspend(commitmentId: string): Promise<void> {
    if (this.scheduled.has(commitmentId)) {
      this.suspended.add(commitmentId);
      console.log(
        `[InMemoryReminderScheduler] Suspended reminder for ${commitmentId}`,
      );
    }
    return Promise.resolve();
  }

  public reschedule(commitmentId: string): Promise<void> {
    if (this.suspended.has(commitmentId)) {
      this.suspended.delete(commitmentId);
      console.log(
        `[InMemoryReminderScheduler] Rescheduled reminder for ${commitmentId}`,
      );
    } else {
      // If it wasn't suspended but we are asked to reschedule, ensure it's in the scheduled state.
      this.schedule(commitmentId);
    }
    return Promise.resolve();
  }

  public cancel(commitmentId: string): Promise<void> {
    this.scheduled.delete(commitmentId);
    this.suspended.delete(commitmentId);
    console.log(
      `[InMemoryReminderScheduler] Cancelled reminder for ${commitmentId}`,
    );
    return Promise.resolve();
  }

  // Exposed for testing
  public isScheduled(commitmentId: string): boolean {
    return (
      this.scheduled.has(commitmentId) && !this.suspended.has(commitmentId)
    );
  }

  public isSuspended(commitmentId: string): boolean {
    return this.suspended.has(commitmentId);
  }
}
