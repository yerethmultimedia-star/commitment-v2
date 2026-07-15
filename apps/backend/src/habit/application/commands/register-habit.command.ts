export class RegisterHabitCommand {
  constructor(
    public readonly id: string,
    public readonly identityId: string,
    public readonly title: string,
    public readonly recurrenceType: string,
    public readonly daysOfWeek: number[] = [],
    public readonly dayOfMonth?: number,
    public readonly month?: number,
    public readonly reminderHour: number = 9,
    public readonly reminderMinute: number = 0,
    public readonly goalId?: string,
  ) {}
}
