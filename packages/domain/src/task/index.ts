// Aggregate
export { Task } from './aggregate/Task.js';
export type { TaskProps } from './aggregate/Task.js';

// Value Objects
export { TaskId } from './value-objects/task-id.js';
export { TaskTitle } from './value-objects/task-title.js';
export { TaskDescription } from './value-objects/task-description.js';
export { TaskPriority, PriorityType } from './value-objects/task-priority.js';
export { TaskStatus, StatusType } from './value-objects/task-status.js';

// Events
export { TaskRegisteredEvent } from './events/task-registered.event.js';
export type { TaskRegisteredEventPayload } from './events/task-registered.event.js';
export { TaskEditedEvent } from './events/task-edited.event.js';
export type { TaskEditedEventPayload } from './events/task-edited.event.js';
export { TaskCompletedEvent } from './events/task-completed.event.js';
export type { TaskCompletedEventPayload } from './events/task-completed.event.js';
export { TaskReopenedEvent } from './events/task-reopened.event.js';
export type { TaskReopenedEventPayload } from './events/task-reopened.event.js';
export { TaskArchivedEvent } from './events/task-archived.event.js';
export type { TaskArchivedEventPayload } from './events/task-archived.event.js';
export { TaskRestoredEvent } from './events/task-restored.event.js';
export type { TaskRestoredEventPayload } from './events/task-restored.event.js';
export { TaskDeletedEvent } from './events/task-deleted.event.js';
export type { TaskDeletedEventPayload } from './events/task-deleted.event.js';
export { TaskPriorityChangedEvent } from './events/task-priority-changed.event.js';
export type { TaskPriorityChangedEventPayload } from './events/task-priority-changed.event.js';
export { TaskDueDateChangedEvent } from './events/task-due-date-changed.event.js';
export type { TaskDueDateChangedEventPayload } from './events/task-due-date-changed.event.js';
export { TaskDuplicatedEvent } from './events/task-duplicated.event.js';
export type { TaskDuplicatedEventPayload } from './events/task-duplicated.event.js';

// Repository
export type { TaskRepository } from './repositories/task-repository.interface.js';

// Errors
export {
  TaskError,
  InvalidTaskTitleError,
  InvalidTaskDescriptionError,
  InvalidTaskPriorityError,
  InvalidTaskStatusError,
  TaskAlreadyCompletedError,
  TaskAlreadyArchivedError,
  TaskAlreadyDeletedError,
  TaskCannotBeCompletedError,
  TaskCannotBeReopenedError,
  TaskCannotBeArchivedError,
  TaskCannotBeRestoredError,
  InvalidTaskStateTransitionError,
  TaskNotFoundError
} from './errors/task-errors.js';

// Constants
export { TaskConstraints } from './constants/task-constraints.js';
