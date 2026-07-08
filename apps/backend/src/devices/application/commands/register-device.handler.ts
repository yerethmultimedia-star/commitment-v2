import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RegisterDeviceCommand } from './register-device.command';
import type { DeviceRepository } from '../ports/device.repository.port';
import { Device } from '@commitment/domain';

@CommandHandler(RegisterDeviceCommand)
export class RegisterDeviceHandler implements ICommandHandler<RegisterDeviceCommand> {
  private readonly logger = new Logger(RegisterDeviceHandler.name);

  constructor(
    @Inject('DeviceRepository')
    private readonly repository: DeviceRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterDeviceCommand): Promise<void> {
    this.logger.debug(
      `Registering device ${command.deviceId} for identity ${command.identityId}`,
    );

    let device = await this.repository.findById(command.deviceId);

    if (device) {
      if (device.identityId !== command.identityId) {
        throw new Error('Device is already registered to a different identity');
      }
      device.update(command.pushToken, command.appVersion);
      await this.repository.save(device);

      const events = device.getUncommittedEvents();
      for (const event of events) {
        this.eventBus.publish(event);
      }
      device.clearUncommittedEvents();
    } else {
      device = Device.register(
        command.deviceId,
        command.identityId,
        command.platform,
        command.pushToken,
        command.appVersion,
      );
      await this.repository.save(device);
      const events = device.getUncommittedEvents();
      for (const event of events) {
        this.eventBus.publish(event);
      }
      device.clearUncommittedEvents();
    }
  }
}
