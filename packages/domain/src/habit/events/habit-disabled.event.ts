import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitDisabledEventPayload {
  readonly habitId: string;
}

export class HabitDisabledEvent implements DomainEvent<HabitDisabledEventPayload> {
  public readonly name = 'habit.disabled';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitDisabledEventPayload;

  constructor(aggregateId: string, payload: HabitDisabledEventPayload, occurredAt?: string) {
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
