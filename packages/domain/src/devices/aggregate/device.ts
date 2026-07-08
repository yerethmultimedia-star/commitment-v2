import { AggregateRoot } from '../../shared/aggregate-root.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { DeviceRegisteredEvent } from '../events/device-registered.event.js';
import { DeviceUpdatedEvent } from '../events/device-updated.event.js';

export class Device extends AggregateRoot<string> {
  private _identityId!: string;
  private _platform!: string;
  private _pushToken!: string;
  private _appVersion!: string;
  private _lastSeenAt!: Date;

  private constructor(id: string) {
    super(id);
  }

  public static register(
    deviceId: string,
    identityId: string,
    platform: string,
    pushToken: string,
    appVersion: string
  ): Device {
    const device = new Device(deviceId);
    device.recordEvent(
      new DeviceRegisteredEvent(deviceId, {
        deviceId,
        identityId,
        platform,
        pushToken,
        appVersion,
      })
    );
    return device;
  }

  public update(pushToken: string, appVersion: string): void {
    let updated = false;

    if (this._pushToken !== pushToken) {
      updated = true;
    }

    if (this._appVersion !== appVersion) {
      updated = true;
    }

    if (updated) {
      this.recordEvent(new DeviceUpdatedEvent(this.id, {
        deviceId: this.id,
        identityId: this._identityId,
        pushToken,
        appVersion,
      }));
    }
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'device.registered') {
      const payload = (event as DeviceRegisteredEvent).payload;
      this._identityId = payload.identityId;
      this._platform = payload.platform;
      this._pushToken = payload.pushToken;
      this._appVersion = payload.appVersion;
      this._lastSeenAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'device.updated') {
      const payload = (event as DeviceUpdatedEvent).payload;
      this._pushToken = payload.pushToken;
      this._appVersion = payload.appVersion;
      this._lastSeenAt = new Date(event.metadata.occurredAt);
    }
  }

  get identityId(): string {
    return this._identityId;
  }

  get platform(): string {
    return this._platform;
  }

  get pushToken(): string {
    return this._pushToken;
  }

  get appVersion(): string {
    return this._appVersion;
  }

  get lastSeenAt(): Date {
    return this._lastSeenAt;
  }
}
