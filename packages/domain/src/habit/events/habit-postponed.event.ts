import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitPostponedEventPayload {
  readonly habitId: string;
  /** ISO datetime — always later today (see HabitOccurrenceMissedEvent for the crosses-midnight case). */
  readonly postponedUntil: string;
}

export class HabitPostponedEvent implements DomainEvent<HabitPostponedEventPayload> {
  public readonly name = 'habit.postponed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitPostponedEventPayload;

  constructor(aggregateId: string, payload: HabitPostponedEventPayload, occurredAt?: string) {
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
