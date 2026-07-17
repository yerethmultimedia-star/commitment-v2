import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitRelinkedToGoalEventPayload {
  readonly habitId: string;
  /** null means the habit is now goal-independent — a deliberate, valid state, not "unset". */
  readonly goalId: string | null;
}

export class HabitRelinkedToGoalEvent implements DomainEvent<HabitRelinkedToGoalEventPayload> {
  public readonly name = 'habit.relinked_to_goal';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitRelinkedToGoalEventPayload;

  constructor(aggregateId: string, payload: HabitRelinkedToGoalEventPayload, occurredAt?: string) {
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
