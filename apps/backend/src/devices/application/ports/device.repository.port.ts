import { Device } from '@commitment/domain';

export interface DeviceRepository {
  save(device: Device): Promise<void>;
  findById(deviceId: string): Promise<Device | null>;
  findByPushToken(pushToken: string): Promise<Device | null>;
}
