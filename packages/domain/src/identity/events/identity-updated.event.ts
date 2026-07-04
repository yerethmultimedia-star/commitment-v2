import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export class IdentityUpdatedEvent implements DomainEvent {
  public readonly name = 'identity.updated';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: {
    readonly identityId: string;
    readonly displayName: string;
    readonly preferredLanguage: string;
    readonly preferredTimeZone: string;
  };

  constructor(
    aggregateId: string,
    payload: {
      identityId: string;
      displayName: string;
      preferredLanguage: string;
      preferredTimeZone: string;
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
