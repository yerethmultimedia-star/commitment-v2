export class ActivityDto {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly version: number,
    public readonly occurredAt: string,
    public readonly actor: string,
    public readonly metadata: Record<string, any>,
  ) {}
}
