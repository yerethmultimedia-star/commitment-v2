import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';
import { BlockedType } from '../value-objects/task-status.js';

export interface TaskBlockedEventPayload {
  readonly taskId: string;
  readonly blockedType: BlockedType;
  readonly blockedReason?: string;
  /** The operational status (`pending`/`in_progress`) Unblock must restore. */
  readonly previousStatus: string;
}

export class TaskBlockedEvent implements DomainEvent {
  public readonly name = 'task.blocked';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskBlockedEventPayload;

  constructor(
    aggregateId: string,
    payload: TaskBlockedEventPayload,
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
