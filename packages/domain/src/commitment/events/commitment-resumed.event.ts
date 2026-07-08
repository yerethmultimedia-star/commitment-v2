import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CommitmentResumedEventPayload {
  readonly commitmentId: string;
  readonly targetDate?: string;
}

export class CommitmentResumedEvent implements DomainEvent {
  public readonly name = 'commitment.resumed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CommitmentResumedEventPayload;

  constructor(
    aggregateId: string,
    payload: CommitmentResumedEventPayload,
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
