export class ListCommitmentsQuery {
  constructor(
    public readonly status?: string,
    public readonly search?: string,
    public readonly sortBy?: string,
  ) {}
}
