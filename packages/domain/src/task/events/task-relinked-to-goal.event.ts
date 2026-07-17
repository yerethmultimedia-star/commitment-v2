import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface TaskRelinkedToGoalEventPayload {
  readonly taskId: string;
  /** null means the task is now goal-independent — a deliberate, valid state, not "unset". */
  readonly goalId: string | null;
}

export class TaskRelinkedToGoalEvent implements DomainEvent<TaskRelinkedToGoalEventPayload> {
  public readonly name = 'task.relinked_to_goal';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: TaskRelinkedToGoalEventPayload;

  constructor(aggregateId: string, payload: TaskRelinkedToGoalEventPayload, occurredAt?: string) {
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
