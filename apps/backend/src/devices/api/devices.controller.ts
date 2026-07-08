import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDeviceCommand } from '../application/commands/register-device.command';

interface RegisterDeviceDto {
  identityId: string;
  deviceId: string;
  platform: string;
  pushToken: string;
  appVersion: string;
}

@Controller('devices')
export class DevicesController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterDeviceDto): Promise<void> {
    await this.commandBus.execute(
      new RegisterDeviceCommand(
        dto.deviceId,
        dto.identityId,
        dto.platform,
        dto.pushToken,
        dto.appVersion,
      ),
    );
  }
}
