import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface GoalRenamedEventPayload {
  readonly goalId: string;
  readonly title: string;
}

export class GoalRenamedEvent implements DomainEvent {
  public readonly name = 'goal.renamed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalRenamedEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalRenamedEventPayload,
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
