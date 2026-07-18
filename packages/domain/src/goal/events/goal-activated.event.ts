import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface GoalActivatedEventPayload {
  readonly goalId: string;
  readonly identityId: string;
}

export class GoalActivatedEvent implements DomainEvent {
  public readonly name = 'goal.activated';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalActivatedEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalActivatedEventPayload,
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
