export class CompleteTaskCommand {
  constructor(
    public readonly id: string,
    public readonly actualMinutes?: number,
  ) {}
}
