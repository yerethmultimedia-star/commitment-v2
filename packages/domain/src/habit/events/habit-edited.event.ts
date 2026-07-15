import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitEditedEventPayload {
  readonly habitId: string;
  readonly title?: string;
  readonly recurrenceType?: string;
  readonly daysOfWeek?: readonly number[];
  readonly dayOfMonth?: number | null;
  readonly month?: number | null;
  readonly reminderHour?: number;
  readonly reminderMinute?: number;
  /** True when the recurrence type newly became Biweekly — tells applyEvent to reset recurrenceAnchorDate to occurredAt. */
  readonly resetRecurrenceAnchor?: boolean;
}

export class HabitEditedEvent implements DomainEvent<HabitEditedEventPayload> {
  public readonly name = 'habit.edited';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitEditedEventPayload;

  constructor(aggregateId: string, payload: HabitEditedEventPayload, occurredAt?: string) {
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
