import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskStartedEventPayload {
  readonly taskId: string;
}

export class TaskStartedEvent implements DomainEvent {
  public readonly name = 'task.started';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskStartedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskStartedEventPayload,
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
