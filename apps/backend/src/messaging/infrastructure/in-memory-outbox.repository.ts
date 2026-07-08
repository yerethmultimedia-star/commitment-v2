import { OutboxRepository } from '../application/ports/outbox.repository.port';
import { IntegrationMessage, OutboxStatus } from '@commitment/domain';

export class InMemoryOutboxRepository implements OutboxRepository {
  private readonly messages: Map<string, IntegrationMessage> = new Map();

  append(messages: IntegrationMessage[]): Promise<void> {
    for (const message of messages) {
      if (this.messages.has(message.messageId)) {
        throw new Error(
          `Message with id ${message.messageId} already exists in Outbox`,
        );
      }
      this.messages.set(message.messageId, this.cloneMessage(message));
    }
    return Promise.resolve();
  }

  async nextPending(limit: number): Promise<IntegrationMessage[]> {
    const pendingMessages: IntegrationMessage[] = [];

    // Sort by occurredAt to process oldest first
    const allMessages = Array.from(this.messages.values()).sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
    );

    for (const message of allMessages) {
      if (
        message.status === OutboxStatus.Pending ||
        (message.status === OutboxStatus.Failed &&
          message.nextAttempt &&
          message.nextAttempt <= new Date())
      ) {
        pendingMessages.push(this.cloneMessage(message));
        if (pendingMessages.length >= limit) {
          break;
        }
      }
    }

    return Promise.resolve(pendingMessages);
  }

  saveMany(messages: IntegrationMessage[]): Promise<void> {
    for (const message of messages) {
      if (!this.messages.has(message.messageId)) {
        throw new Error(
          `Message with id ${message.messageId} not found in Outbox for update`,
        );
      }
      this.messages.set(message.messageId, this.cloneMessage(message));
    }
    return Promise.resolve();
  }

  private cloneMessage(message: IntegrationMessage): IntegrationMessage {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cloned = Object.assign(
      Object.create(Object.getPrototypeOf(message) as object),
      message,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cloned;
  }
}
