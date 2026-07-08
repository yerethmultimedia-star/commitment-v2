import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterDeviceHandler } from './application/commands/register-device.handler';
import { InMemoryDeviceRepository } from './infrastructure/in-memory-device.repository';
import { DevicesController } from './api/devices.controller';

@Module({
  imports: [CqrsModule],
  controllers: [DevicesController],
  providers: [
    RegisterDeviceHandler,
    {
      provide: 'DeviceRepository',
      useClass: InMemoryDeviceRepository,
    },
  ],
})
export class DevicesModule {}
