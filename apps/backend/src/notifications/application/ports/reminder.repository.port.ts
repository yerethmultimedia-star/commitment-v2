import { Reminder } from '@commitment/domain';

export interface ReminderRepository {
  save(reminder: Reminder): Promise<void>;
  findByCommitmentId(commitmentId: string): Promise<Reminder | null>;
  findById(id: string): Promise<Reminder | null>;
  findReady(now: Date): Promise<Reminder[]>;
}
