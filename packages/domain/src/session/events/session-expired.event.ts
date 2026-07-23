import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface SessionExpiredEventPayload {
  readonly sessionId: string;
  readonly identityId: string;
}

export class SessionExpiredEvent implements DomainEvent {
  public readonly name = 'session.expired';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: SessionExpiredEventPayload;

  constructor(
    aggregateId: string,
    payload: SessionExpiredEventPayload,
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
