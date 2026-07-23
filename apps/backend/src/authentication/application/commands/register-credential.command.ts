export class RegisterCredentialCommand {
  constructor(
    public readonly credentialId: string,
    public readonly identityId: string,
    public readonly loginIdentifier: string,
    public readonly secret: string,
  ) {}
}
