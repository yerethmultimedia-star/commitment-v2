import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitUncompletedEventPayload {
  readonly habitId: string;
  /** ISO yyyy-mm-dd of the occurrence being un-completed. */
  readonly onDate: string;
}

export class HabitUncompletedEvent implements DomainEvent<HabitUncompletedEventPayload> {
  public readonly name = 'habit.uncompleted';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitUncompletedEventPayload;

  constructor(aggregateId: string, payload: HabitUncompletedEventPayload, occurredAt?: string) {
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
