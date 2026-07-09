import { IntegrationMessage } from '@commitment/domain';

export interface OutboxRepository {
  append(messages: IntegrationMessage[]): Promise<void>;
  nextPending(limit: number): Promise<IntegrationMessage[]>;
  saveMany(messages: IntegrationMessage[]): Promise<void>;
  findById(id: string): Promise<IntegrationMessage | null>;
  getDeadLetterMessages(): Promise<IntegrationMessage[]>;
  countPending(): Promise<number>;
  countDeadLetter(): Promise<number>;
}

export const OUTBOX_REPOSITORY_TOKEN = 'OutboxRepository';
