import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskCompletedEventPayload {
  readonly taskId: string;
  readonly completedAt: string;
}

export class TaskCompletedEvent implements DomainEvent {
  public readonly name = 'task.completed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskCompletedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskCompletedEventPayload,
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
