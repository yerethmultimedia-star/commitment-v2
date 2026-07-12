export class EditTaskCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly estimatedMinutes?: number,
    public readonly tags?: string[],
    public readonly metadata?: Record<string, any>,
  ) {}
}
