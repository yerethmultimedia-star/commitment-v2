import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskReturnedToPendingEventPayload {
  readonly taskId: string;
}

export class TaskReturnedToPendingEvent implements DomainEvent {
  public readonly name = 'task.returned_to_pending';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskReturnedToPendingEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskReturnedToPendingEventPayload,
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
