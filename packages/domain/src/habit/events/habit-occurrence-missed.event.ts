import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitOccurrenceMissedEventPayload {
  readonly habitId: string;
  /** ISO yyyy-mm-dd of the occurrence that was missed. */
  readonly missedOn: string;
  readonly streakDays: number;
  readonly graceUsed: boolean;
}

export class HabitOccurrenceMissedEvent implements DomainEvent<HabitOccurrenceMissedEventPayload> {
  public readonly name = 'habit.occurrence_missed';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitOccurrenceMissedEventPayload;

  constructor(aggregateId: string, payload: HabitOccurrenceMissedEventPayload, occurredAt?: string) {
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
