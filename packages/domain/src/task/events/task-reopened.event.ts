import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskReopenedEventPayload {
  readonly taskId: string;
}

export class TaskReopenedEvent implements DomainEvent {
  public readonly name = 'task.reopened';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskReopenedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskReopenedEventPayload,
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
