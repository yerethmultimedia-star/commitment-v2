export class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidTaskTitleError extends TaskError {}
export class InvalidTaskDescriptionError extends TaskError {}
export class InvalidTaskPriorityError extends TaskError {}
export class InvalidTaskStatusError extends TaskError {}
export class TaskAlreadyCompletedError extends TaskError {}
export class TaskAlreadyCancelledError extends TaskError {}
export class TaskAlreadyDeletedError extends TaskError {}
export class TaskCannotBeCompletedError extends TaskError {}
export class TaskCannotBeReopenedError extends TaskError {}
export class TaskReopenBlockedByCommitmentError extends TaskError {}
export class TaskCannotBeStartedError extends TaskError {}
export class TaskCannotBeBlockedError extends TaskError {}
export class TaskCannotBeUnblockedError extends TaskError {}
export class TaskCannotBeUnblockedManuallyError extends TaskError {}
export class TaskCannotBeCancelledError extends TaskError {}
export class TaskCannotReturnToPendingError extends TaskError {}
export class InvalidTaskStateTransitionError extends TaskError {}
export class TaskNotFoundError extends TaskError {}

// TaskDependency (ADR-022 §5)
export class TaskDependencyCycleError extends TaskError {}
export class InvalidTaskDependencyError extends TaskError {}
