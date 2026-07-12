export class RegisterTaskCommand {
  constructor(
    public readonly id: string,
    public readonly identityId: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly priority: string = 'medium',
    public readonly estimatedMinutes: number = 0,
    public readonly dueDate?: string,
    public readonly commitmentId?: string,
    public readonly goalId?: string,
    public readonly tags: string[] = [],
    public readonly metadata: Record<string, any> = {},
  ) {}
}
