import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CredentialBlockedEventPayload {
  readonly credentialId: string;
  readonly identityId: string;
}

export class CredentialBlockedEvent implements DomainEvent {
  public readonly name = 'credential.blocked';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CredentialBlockedEventPayload;

  constructor(
    aggregateId: string,
    payload: CredentialBlockedEventPayload,
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
      tenantId: null,
    };
  }
}
