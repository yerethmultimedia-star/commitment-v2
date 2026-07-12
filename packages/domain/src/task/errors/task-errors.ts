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
export class TaskAlreadyArchivedError extends TaskError {}
export class TaskAlreadyDeletedError extends TaskError {}
export class TaskCannotBeCompletedError extends TaskError {}
export class TaskCannotBeReopenedError extends TaskError {}
export class TaskCannotBeArchivedError extends TaskError {}
export class TaskCannotBeRestoredError extends TaskError {}
export class InvalidTaskStateTransitionError extends TaskError {}
export class TaskNotFoundError extends TaskError {}
