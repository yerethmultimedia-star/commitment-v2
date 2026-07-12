import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskEditedEventPayload {
  readonly taskId: string;
  readonly title?: string;
  readonly description?: string;
  readonly priority?: string;
  readonly estimatedMinutes?: number;
  readonly actualMinutes?: number;
  readonly startDate?: string | null;
  readonly dueDate?: string | null;
  readonly commitmentId?: string | null;
  readonly goalId?: string | null;
  readonly tags?: string[];
  readonly metadata?: Record<string, any>;
}

export class TaskEditedEvent implements DomainEvent {
  public readonly name = 'task.edited';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskEditedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskEditedEventPayload,
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
