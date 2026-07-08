import { Injectable } from '@nestjs/common';
import { Device } from '@commitment/domain';
import { DeviceRepository } from '../application/ports/device.repository.port';

@Injectable()
export class InMemoryDeviceRepository implements DeviceRepository {
  private readonly devices = new Map<string, Device>();

  public async save(device: Device): Promise<void> {
    await Promise.resolve();
    this.devices.set(device.id, device);
  }

  public async findById(deviceId: string): Promise<Device | null> {
    await Promise.resolve();
    return this.devices.get(deviceId) || null;
  }

  public async findByPushToken(pushToken: string): Promise<Device | null> {
    await Promise.resolve();
    for (const device of this.devices.values()) {
      if (device.pushToken === pushToken) {
        return device;
      }
    }
    return null;
  }
}
