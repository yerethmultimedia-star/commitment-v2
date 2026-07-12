export class QuickCaptureCommand {
  constructor(
    public readonly text: string,
    public readonly source: string,
    public readonly identityId: string,
    public readonly date?: string,
    public readonly context?: Record<string, any>,
  ) {}
}
