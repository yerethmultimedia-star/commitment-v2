export interface ReminderExecutionEngine {
  enqueue(reminderId: string): Promise<void>;
  cancel(reminderId: string): Promise<void>;
}
