import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CommitmentActivatedEventPayload {
  readonly commitmentId: string;
  readonly identityId: string;
  readonly targetDate?: string;
  readonly seriesId: string;
  readonly recurrencePattern: string;
}

export class CommitmentActivatedEvent implements DomainEvent {
  public readonly name = 'commitment.activated';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CommitmentActivatedEventPayload;

  constructor(
    aggregateId: string,
    payload: CommitmentActivatedEventPayload,
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
