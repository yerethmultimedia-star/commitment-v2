export class CreateTaskDependencyCommand {
  constructor(
    public readonly predecessorTaskId: string,
    public readonly successorTaskId: string,
  ) {}
}
