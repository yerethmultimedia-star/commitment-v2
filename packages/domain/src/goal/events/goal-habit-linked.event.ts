import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

/**
 * Records that a habit (identified by a plain id — Habit has no domain
 * aggregate yet, see VS-031 Phase 3) now belongs to this Goal. Same
 * Goal-owned linking pattern as GoalCommitmentLinkedEvent.
 */
export interface GoalHabitLinkedEventPayload {
  readonly goalId: string;
  readonly habitId: string;
}

export class GoalHabitLinkedEvent implements DomainEvent {
  public readonly name = 'goal.habit_linked';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalHabitLinkedEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalHabitLinkedEventPayload,
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
