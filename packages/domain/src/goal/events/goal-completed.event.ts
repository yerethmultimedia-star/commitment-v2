import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface GoalCompletedEventPayload {
  readonly goalId: string;
  readonly identityId: string;
  readonly title: string;
  readonly completedAt: string;
}

export class GoalCompletedEvent implements DomainEvent {
  public readonly name = 'goal.completed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalCompletedEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalCompletedEventPayload,
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
