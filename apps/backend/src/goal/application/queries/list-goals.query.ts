export class ListGoalsQuery {
  constructor(
    public readonly status?: string,
    public readonly search?: string,
  ) {}
}
