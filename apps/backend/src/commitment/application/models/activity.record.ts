export class ActivityRecord {
  constructor(
    public readonly id: string,
    public readonly commitmentId: string,
    public readonly type: string,
    public readonly version: number,
    public readonly occurredAt: Date,
    public readonly actor: string,
    public readonly metadata: Record<string, any>,
  ) {}
}
