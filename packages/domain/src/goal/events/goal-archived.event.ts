import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface GoalArchivedEventPayload {
  readonly goalId: string;
}

export class GoalArchivedEvent implements DomainEvent {
  public readonly name = 'goal.archived';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalArchivedEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalArchivedEventPayload,
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
