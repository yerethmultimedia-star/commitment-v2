export class LoginCommand {
  constructor(
    public readonly sessionId: string,
    public readonly loginIdentifier: string,
    public readonly secret: string,
  ) {}
}
