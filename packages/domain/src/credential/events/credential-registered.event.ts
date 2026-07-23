import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface CredentialRegisteredEventPayload {
  readonly credentialId: string;
  readonly identityId: string;
  readonly loginIdentifier: string;
}

export class CredentialRegisteredEvent implements DomainEvent {
  public readonly name = 'credential.registered';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: CredentialRegisteredEventPayload;

  constructor(
    aggregateId: string,
    payload: CredentialRegisteredEventPayload,
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
