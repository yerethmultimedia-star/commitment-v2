import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface GoalRegisteredEventPayload {
  readonly goalId: string;
  readonly identityId: string;
  readonly title: string;
  readonly description: string;
}

export class GoalRegisteredEvent implements DomainEvent {
  public readonly name = 'goal.registered';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalRegisteredEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalRegisteredEventPayload,
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
