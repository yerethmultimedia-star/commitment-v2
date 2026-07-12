export class QuickCaptureResult {
  constructor(
    public readonly id: string,
    public readonly type: 'task' | 'goal' | 'habit' | 'note',
  ) {}
}
