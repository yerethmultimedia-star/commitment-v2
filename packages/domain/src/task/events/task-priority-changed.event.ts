import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskPriorityChangedEventPayload {
  readonly taskId: string;
  readonly priority: string;
}

export class TaskPriorityChangedEvent implements DomainEvent {
  public readonly name = 'task.priority_changed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskPriorityChangedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskPriorityChangedEventPayload,
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
