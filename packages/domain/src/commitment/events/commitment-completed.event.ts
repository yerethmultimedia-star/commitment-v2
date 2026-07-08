import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CommitmentCompletedEventPayload {
  readonly commitmentId: string;
  readonly identityId: string;
  readonly title: string;
  readonly description: string;
  readonly recurrencePattern: string;
  readonly targetDate?: string;
  readonly seriesId: string;
}

export class CommitmentCompletedEvent implements DomainEvent {
  public readonly name = 'commitment.completed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CommitmentCompletedEventPayload;

  constructor(
    aggregateId: string,
    payload: CommitmentCompletedEventPayload,
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
