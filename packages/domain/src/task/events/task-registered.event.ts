import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskRegisteredEventPayload {
  readonly taskId: string;
  readonly identityId: string;
  readonly title: string;
  readonly description: string;
  readonly priority: string;
  readonly status: string;
  readonly estimatedMinutes: number;
  readonly dueDate?: string;
  readonly commitmentId?: string;
  readonly goalId?: string;
  readonly tags: string[];
  readonly metadata: Record<string, any>;
  readonly createdAt: string;
}

export class TaskRegisteredEvent implements DomainEvent {
  public readonly name = 'task.registered';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskRegisteredEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskRegisteredEventPayload,
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
