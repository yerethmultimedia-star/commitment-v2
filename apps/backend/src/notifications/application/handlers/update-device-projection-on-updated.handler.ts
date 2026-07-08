import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { DeviceUpdatedEvent } from '@commitment/domain';
import { NotificationDeviceProjection } from '../ports/notification-device-projection.repository';
import type { NotificationDeviceProjectionRepository } from '../ports/notification-device-projection.repository';

@EventsHandler(DeviceUpdatedEvent)
export class UpdateDeviceProjectionOnUpdatedHandler implements IEventHandler<DeviceUpdatedEvent> {
  private readonly logger = new Logger(
    UpdateDeviceProjectionOnUpdatedHandler.name,
  );

  constructor(
    @Inject('NotificationDeviceProjectionRepository')
    private readonly repository: NotificationDeviceProjectionRepository,
  ) {}

  async handle(event: DeviceUpdatedEvent): Promise<void> {
    this.logger.debug(
      `DeviceUpdatedEvent received for device ${event.payload.deviceId}, pushToken: ${event.payload.pushToken}`,
    );

    // In our simplified projection, we key by identityId.
    // In a real multi-device scenario we would project a list of devices per identity.
    // For now, we update the main token.
    const projection = await this.repository.findByIdentityId(
      event.payload.identityId,
    );

    if (projection) {
      // Just overwrite with latest token
      const updated = new NotificationDeviceProjection(
        event.payload.identityId,
        event.payload.pushToken,
        projection.platform, // Keep existing platform, or event needs platform too
        new Date(event.metadata.occurredAt),
      );
      await this.repository.save(updated);
    }
  }
}
