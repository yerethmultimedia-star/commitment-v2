export class RegisterDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly identityId: string,
    public readonly platform: string,
    public readonly pushToken: string,
    public readonly appVersion: string,
  ) {}
}
