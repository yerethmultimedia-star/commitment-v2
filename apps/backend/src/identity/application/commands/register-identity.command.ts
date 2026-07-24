export class RegisterIdentityCommand {
  constructor(
    public readonly identityId: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly preferredLanguage: string,
    public readonly preferredTimeZone: string,
  ) {}
}
