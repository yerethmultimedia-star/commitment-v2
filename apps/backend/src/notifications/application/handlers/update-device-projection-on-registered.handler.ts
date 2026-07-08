import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { DeviceRegisteredEvent } from '@commitment/domain';
import { NotificationDeviceProjection } from '../ports/notification-device-projection.repository';
import type { NotificationDeviceProjectionRepository } from '../ports/notification-device-projection.repository';

@EventsHandler(DeviceRegisteredEvent)
export class UpdateDeviceProjectionOnRegisteredHandler implements IEventHandler<DeviceRegisteredEvent> {
  private readonly logger = new Logger(
    UpdateDeviceProjectionOnRegisteredHandler.name,
  );

  constructor(
    @Inject('NotificationDeviceProjectionRepository')
    private readonly repository: NotificationDeviceProjectionRepository,
  ) {}

  async handle(event: DeviceRegisteredEvent): Promise<void> {
    this.logger.debug(
      `Updating device projection for identity ${event.payload.identityId}`,
    );

    const projection = new NotificationDeviceProjection(
      event.payload.identityId,
      event.payload.pushToken,
      event.payload.platform,
      new Date(event.metadata.occurredAt),
    );

    await this.repository.save(projection);
  }
}
