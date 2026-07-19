import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskUnblockedEventPayload {
  readonly taskId: string;
  readonly source: 'manual' | 'system';
  /** The operational status (`pending`/`in_progress`) restored. */
  readonly resultingStatus: string;
}

export class TaskUnblockedEvent implements DomainEvent {
  public readonly name = 'task.unblocked';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskUnblockedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskUnblockedEventPayload,
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
