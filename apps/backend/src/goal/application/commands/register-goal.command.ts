export class RegisterGoalCommand {
  constructor(
    public readonly id: string,
    public readonly identityId: string,
    public readonly title: string,
    public readonly description?: string,
  ) {}
}
