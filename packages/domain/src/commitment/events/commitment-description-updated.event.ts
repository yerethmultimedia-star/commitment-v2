import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export class CommitmentDescriptionUpdatedEvent implements DomainEvent {
  public readonly name = 'commitment.description_updated';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: {
    readonly commitmentId: string;
    readonly description: string;
  };

  constructor(
    aggregateId: string,
    payload: {
      commitmentId: string;
      description: string;
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
