export class ListHabitsQuery {
  constructor(
    public readonly identityId?: string,
    public readonly state?: string,
    public readonly goalId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
