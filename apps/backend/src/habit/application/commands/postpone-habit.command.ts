export class PostponeHabitCommand {
  constructor(
    public readonly id: string,
    public readonly minutes: number,
  ) {}
}
