export class ScheduleTaskCommand {
  constructor(
    public readonly id: string,
    /** Explicit null clears the due date — omitting the field entirely is a validation error at the API boundary, mirroring RelinkTaskGoalCommand's own convention. */
    public readonly dueDate: string | null,
    /** Defaults to null (no start date) when the caller doesn't pass one, matching Task.schedule()'s own default. */
    public readonly startDate: string | null = null,
  ) {}
}
