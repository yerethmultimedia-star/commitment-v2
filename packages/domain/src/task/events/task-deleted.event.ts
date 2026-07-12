import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskDeletedEventPayload {
  readonly taskId: string;
}

export class TaskDeletedEvent implements DomainEvent {
  public readonly name = 'task.deleted';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskDeletedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskDeletedEventPayload,
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
