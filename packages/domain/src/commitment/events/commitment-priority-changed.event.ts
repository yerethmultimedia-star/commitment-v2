import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CommitmentPriorityChangedEventPayload {
  readonly commitmentId: string;
  readonly priority: string;
}

export class CommitmentPriorityChangedEvent implements DomainEvent {
  public readonly name = 'commitment.priority_changed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CommitmentPriorityChangedEventPayload;

  constructor(
    aggregateId: string,
    payload: CommitmentPriorityChangedEventPayload,
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
