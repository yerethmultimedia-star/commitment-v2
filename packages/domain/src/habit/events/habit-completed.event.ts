import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitCompletedEventPayload {
  readonly habitId: string;
  /** ISO yyyy-mm-dd of the occurrence being completed. */
  readonly completedOn: string;
  readonly streakDays: number;
  readonly graceUsed: boolean;
}

export class HabitCompletedEvent implements DomainEvent<HabitCompletedEventPayload> {
  public readonly name = 'habit.completed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitCompletedEventPayload;

  constructor(aggregateId: string, payload: HabitCompletedEventPayload, occurredAt?: string) {
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
