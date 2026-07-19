import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskDueDateChangedEventPayload {
  readonly taskId: string;
  readonly identityId: string;
  readonly dueDate: string | null;
}

export class TaskDueDateChangedEvent implements DomainEvent {
  public readonly name = 'task.due_date_changed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskDueDateChangedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskDueDateChangedEventPayload,
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
