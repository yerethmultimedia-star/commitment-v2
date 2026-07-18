import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface GoalDescriptionUpdatedEventPayload {
  readonly goalId: string;
  readonly description: string;
}

export class GoalDescriptionUpdatedEvent implements DomainEvent {
  public readonly name = 'goal.description_updated';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalDescriptionUpdatedEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalDescriptionUpdatedEventPayload,
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
