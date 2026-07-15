import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitEnabledEventPayload {
  readonly habitId: string;
}

export class HabitEnabledEvent implements DomainEvent<HabitEnabledEventPayload> {
  public readonly name = 'habit.enabled';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitEnabledEventPayload;

  constructor(aggregateId: string, payload: HabitEnabledEventPayload, occurredAt?: string) {
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
