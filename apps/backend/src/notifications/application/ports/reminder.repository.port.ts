import { Reminder, ReminderSourceType } from '@commitment/domain';

export interface ReminderRepository {
  save(reminder: Reminder): Promise<void>;
  findBySourceId(
    sourceId: string,
    sourceType: ReminderSourceType,
  ): Promise<Reminder | null>;
  findById(id: string): Promise<Reminder | null>;
  findReady(now: Date): Promise<Reminder[]>;
}
