import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskArchivedEventPayload {
  readonly taskId: string;
}

export class TaskArchivedEvent implements DomainEvent {
  public readonly name = 'task.archived';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskArchivedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskArchivedEventPayload,
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
