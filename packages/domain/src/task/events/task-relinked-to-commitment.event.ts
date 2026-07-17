import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskRelinkedToCommitmentEventPayload {
  readonly taskId: string;
  /** null means the task is now commitment-independent — a deliberate, valid state, not "unset". */
  readonly commitmentId: string | null;
}

export class TaskRelinkedToCommitmentEvent implements DomainEvent<TaskRelinkedToCommitmentEventPayload> {
  public readonly name = 'task.relinked_to_commitment';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskRelinkedToCommitmentEventPayload;

  constructor(aggregateId: string, payload: TaskRelinkedToCommitmentEventPayload, occurredAt?: string) {
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
      tenantId: null,
    };
  }
}
