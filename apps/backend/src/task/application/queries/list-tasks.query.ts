export class ListTasksQuery {
  constructor(
    public readonly identityId?: string,
    public readonly status?: string,
    public readonly priority?: string,
    public readonly dueBefore?: string,
    public readonly dueAfter?: string,
    public readonly commitmentId?: string,
    public readonly search?: string,
    public readonly sort?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
