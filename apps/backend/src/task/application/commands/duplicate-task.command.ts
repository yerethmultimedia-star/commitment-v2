export class DuplicateTaskCommand {
  constructor(
    public readonly id: string,
    public readonly newId: string,
  ) {}
}
