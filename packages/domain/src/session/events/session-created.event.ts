import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface SessionCreatedEventPayload {
  readonly sessionId: string;
  readonly identityId: string;
  readonly expiresAt: string;
}

export class SessionCreatedEvent implements DomainEvent {
  public readonly name = 'session.created';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: SessionCreatedEventPayload;

  constructor(
    aggregateId: string,
    payload: SessionCreatedEventPayload,
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
