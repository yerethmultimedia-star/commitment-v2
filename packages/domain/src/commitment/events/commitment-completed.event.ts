import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export class CommitmentCompletedEvent implements DomainEvent {
  public readonly name = 'commitment.completed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: {
    readonly commitmentId: string;
  };

  constructor(
    aggregateId: string,
    payload: {
      commitmentId: string;
    },
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
