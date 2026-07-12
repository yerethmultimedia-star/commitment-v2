export class ChangePriorityTaskCommand {
  constructor(
    public readonly id: string,
    public readonly priority: string,
  ) {}
}
