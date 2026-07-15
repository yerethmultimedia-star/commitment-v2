export class UncompleteHabitCommand {
  constructor(
    public readonly id: string,
    /** ISO yyyy-mm-dd — defaults to today when omitted. */
    public readonly onDate?: string,
  ) {}
}
