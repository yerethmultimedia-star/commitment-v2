import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

export interface DeviceRegisteredEventPayload {
  readonly deviceId: string;
  readonly identityId: string;
  readonly platform: string;
  readonly pushToken: string;
  readonly appVersion: string;
}

export class DeviceRegisteredEvent implements DomainEvent {
  public readonly name = 'device.registered';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: DeviceRegisteredEventPayload;

  constructor(
    aggregateId: string,
    payload: DeviceRegisteredEventPayload,
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
