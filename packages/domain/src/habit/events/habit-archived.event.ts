import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface HabitArchivedEventPayload {
  readonly habitId: string;
}

export class HabitArchivedEvent implements DomainEvent<HabitArchivedEventPayload> {
  public readonly name = 'habit.archived';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: HabitArchivedEventPayload;

  constructor(aggregateId: string, payload: HabitArchivedEventPayload, occurredAt?: string) {
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
