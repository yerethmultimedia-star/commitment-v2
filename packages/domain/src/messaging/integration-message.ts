export interface MessagePayload {
  [key: string]: any;
}

export enum OutboxStatus {
  Pending = 'Pending',
  Publishing = 'Publishing',
  Published = 'Published',
  Failed = 'Failed',
  DeadLetter = 'DeadLetter',
}

export enum ProcessedMessageStatus {
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
}

export class IntegrationMessage {
  constructor(
    public readonly messageId: string,
    public readonly type: string,
    public readonly messageVersion: string,
    public readonly aggregateId: string,
    public readonly aggregateVersion: number,
    public readonly occurredAt: Date,
    public readonly payload: MessagePayload,
    public readonly correlationId: string,
    public readonly causationId: string,
    public status: OutboxStatus = OutboxStatus.Pending,
    public retryCount: number = 0,
    public lastAttempt?: Date,
    public nextAttempt?: Date
  ) {}
}
