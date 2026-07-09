import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CommitmentEditedPayload {
  commitmentId: string;
  title?: string;
  description?: string;
  recurrencePattern?: string;
  targetDate?: string | null;
}

export class CommitmentEditedEvent implements DomainEvent<CommitmentEditedPayload> {
  public readonly name = 'commitment.edited';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CommitmentEditedPayload;

  constructor(
    aggregateId: string,
    payload: CommitmentEditedPayload,
    occurredAt?: string
  ) {
    this.payload = payload;
    const time = occurredAt || new Date().toISOString();
    this.metadata = {
      eventId: '',
      aggregateId,
      aggregateVersion: 0,
      eventVersion: 1,
      occurredAt: time,
      recordedAt: time,
      actorType: 'SYSTEM',
      actorId: '',
      correlationId: '',
      causationId: '',
      tenantId: null
    };
  }
}
