import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskDuplicatedEventPayload {
  readonly originalTaskId: string;
  readonly newTaskId: string;
}

export class TaskDuplicatedEvent implements DomainEvent {
  public readonly name = 'task.duplicated';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskDuplicatedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskDuplicatedEventPayload,
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
