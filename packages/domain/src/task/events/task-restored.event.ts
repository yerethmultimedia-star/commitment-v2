import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskRestoredEventPayload {
  readonly taskId: string;
}

export class TaskRestoredEvent implements DomainEvent {
  public readonly name = 'task.restored';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskRestoredEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskRestoredEventPayload,
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
