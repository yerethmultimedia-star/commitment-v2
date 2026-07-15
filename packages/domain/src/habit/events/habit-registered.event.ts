import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitRegisteredEventPayload {
  readonly habitId: string;
  readonly identityId: string;
  readonly title: string;
  readonly recurrenceType: string;
  readonly daysOfWeek: readonly number[];
  readonly dayOfMonth: number | null;
  readonly month: number | null;
  readonly reminderHour: number;
  readonly reminderMinute: number;
  readonly goalId?: string;
  readonly createdAt: string;
}

export class HabitRegisteredEvent implements DomainEvent<HabitRegisteredEventPayload> {
  public readonly name = 'habit.registered';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitRegisteredEventPayload;

  constructor(aggregateId: string, payload: HabitRegisteredEventPayload, occurredAt?: string) {
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
