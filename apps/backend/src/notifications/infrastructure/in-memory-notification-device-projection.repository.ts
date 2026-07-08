import { Injectable } from '@nestjs/common';
import {
  NotificationDeviceProjection,
  NotificationDeviceProjectionRepository,
} from '../application/ports/notification-device-projection.repository';

@Injectable()
export class InMemoryNotificationDeviceProjectionRepository implements NotificationDeviceProjectionRepository {
  private readonly projections = new Map<
    string,
    NotificationDeviceProjection
  >();

  public async save(projection: NotificationDeviceProjection): Promise<void> {
    await Promise.resolve();
    this.projections.set(projection.identityId, projection);
  }

  public async findByIdentityId(
    identityId: string,
  ): Promise<NotificationDeviceProjection | null> {
    await Promise.resolve();
    return this.projections.get(identityId) || null;
  }
}
