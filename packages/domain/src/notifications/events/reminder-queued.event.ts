import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface ReminderQueuedPayload {
  reminderId: string;
  commitmentId: string;
  identityId: string;
  scheduledFor: string;
}

export class ReminderQueuedEvent implements DomainEvent<ReminderQueuedPayload> {
  public readonly name = 'reminder.queued';
  public readonly metadata: DomainEventMetadata;

  constructor(
    aggregateId: string,
    public readonly payload: ReminderQueuedPayload
  ) {
    this.metadata = {
      eventId: '',
      aggregateId,
      aggregateVersion: 1,
      eventVersion: 1,
      occurredAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      actorType: 'SYSTEM',
      actorId: 'system',
      correlationId: '',
      causationId: '',
      tenantId: null,
    };
  }
}
