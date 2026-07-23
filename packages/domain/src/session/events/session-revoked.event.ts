import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface SessionRevokedEventPayload {
  readonly sessionId: string;
  readonly identityId: string;
}

export class SessionRevokedEvent implements DomainEvent {
  public readonly name = 'session.revoked';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: SessionRevokedEventPayload;

  constructor(
    aggregateId: string,
    payload: SessionRevokedEventPayload,
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
