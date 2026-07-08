import { IntegrationMessage } from '@commitment/domain';

export interface OutboxRepository {
  append(messages: IntegrationMessage[]): Promise<void>;
  nextPending(limit: number): Promise<IntegrationMessage[]>;
  saveMany(messages: IntegrationMessage[]): Promise<void>;
}

export const OUTBOX_REPOSITORY_TOKEN = 'OutboxRepository';
