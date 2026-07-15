export class EditHabitCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly recurrenceType?: string,
    public readonly daysOfWeek?: number[],
    public readonly dayOfMonth?: number,
    public readonly month?: number,
    public readonly reminderHour?: number,
    public readonly reminderMinute?: number,
  ) {}
}
