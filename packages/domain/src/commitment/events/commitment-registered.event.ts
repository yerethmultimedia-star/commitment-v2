import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export class CommitmentRegisteredEvent implements DomainEvent {
  public readonly name = 'commitment.registered';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: {
    readonly commitmentId: string;
    readonly identityId: string;
    readonly title: string;
    readonly description: string;
  };

  constructor(
    aggregateId: string,
    payload: {
      commitmentId: string;
      identityId: string;
      title: string;
      description: string;
    },
    occurredAt: string
  ) {
    this.payload = payload;
    this.metadata = {
      eventId: '',
      aggregateId,
      aggregateVersion: 0,
      eventVersion: 1,
      occurredAt,
      recordedAt: occurredAt,
      actorType: 'SYSTEM',
      actorId: '',
      correlationId: '',
      causationId: '',
      tenantId: null
    };
  }
}
