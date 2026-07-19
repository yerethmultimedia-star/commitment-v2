import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskCancelledEventPayload {
  readonly taskId: string;
}

export class TaskCancelledEvent implements DomainEvent {
  public readonly name = 'task.cancelled';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskCancelledEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskCancelledEventPayload,
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
