export class GoalHistoryEntryDto {
  constructor(
    public readonly type: string,
    public readonly timestamp: string,
    public readonly version: number,
    public readonly summary: string,
    public readonly metadata: Record<string, unknown>,
  ) {}
}
