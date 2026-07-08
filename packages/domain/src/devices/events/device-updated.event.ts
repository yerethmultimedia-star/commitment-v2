import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface DeviceUpdatedEventPayload {
  readonly deviceId: string;
  readonly identityId: string;
  readonly pushToken: string;
  readonly appVersion: string;
}

export class DeviceUpdatedEvent implements DomainEvent {
  public readonly name = 'device.updated';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: DeviceUpdatedEventPayload;

  constructor(
    aggregateId: string,
    payload: DeviceUpdatedEventPayload,
    occurredAt?: string
  ) {
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
      tenantId: null
    };
  }
}
