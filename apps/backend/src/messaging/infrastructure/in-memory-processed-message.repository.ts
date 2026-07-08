import { ProcessedMessageRepository } from '../application/ports/processed-message.repository.port';
import { ProcessedMessageStatus } from '@commitment/domain';

interface ProcessedMessageRecord {
  status: ProcessedMessageStatus;
  error?: string;
  updatedAt: Date;
}

export class InMemoryProcessedMessageRepository implements ProcessedMessageRepository {
  private readonly records: Map<string, ProcessedMessageRecord> = new Map();

  private getKey(messageId: string, consumerName: string): string {
    return `${messageId}:${consumerName}`;
  }

  tryBeginProcessing(
    messageId: string,
    consumerName: string,
  ): Promise<boolean> {
    const key = this.getKey(messageId, consumerName);
    const record = this.records.get(key);

    if (record) {
      if (
        record.status === ProcessedMessageStatus.Completed ||
        record.status === ProcessedMessageStatus.Processing
      ) {
        return Promise.resolve(false);
      }
      // If it was Failed, we allow retrying
    }

    this.records.set(key, {
      status: ProcessedMessageStatus.Processing,
      updatedAt: new Date(),
    });

    return Promise.resolve(true);
  }

  markCompleted(messageId: string, consumerName: string): Promise<void> {
    const key = this.getKey(messageId, consumerName);
    this.records.set(key, {
      status: ProcessedMessageStatus.Completed,
      updatedAt: new Date(),
    });
    return Promise.resolve();
  }

  markFailed(
    messageId: string,
    consumerName: string,
    error?: string,
  ): Promise<void> {
    const key = this.getKey(messageId, consumerName);
    this.records.set(key, {
      status: ProcessedMessageStatus.Failed,
      error,
      updatedAt: new Date(),
    });
    return Promise.resolve();
  }
}
