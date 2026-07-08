import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CommitmentRegisteredEventPayload {
  readonly commitmentId: string;
  readonly identityId: string;
  readonly title: string;
  readonly description: string;
  readonly recurrencePattern: string;
  readonly targetDate?: string;
  readonly seriesId: string;
}

export class CommitmentRegisteredEvent implements DomainEvent {
  public readonly name = 'commitment.registered';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CommitmentRegisteredEventPayload;

  constructor(
    aggregateId: string,
    payload: CommitmentRegisteredEventPayload,
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
