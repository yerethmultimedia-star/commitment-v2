// Aggregate
export { Task } from './aggregate/Task.js';
export type { TaskProps } from './aggregate/Task.js';

// Value Objects
export { TaskId } from './value-objects/task-id.js';
export { TaskTitle } from './value-objects/task-title.js';
export { TaskDescription } from './value-objects/task-description.js';
export { TaskPriority, PriorityType } from './value-objects/task-priority.js';
export { TaskStatus, StatusType } from './value-objects/task-status.js';
export type { BlockedType } from './value-objects/task-status.js';

// Events
export { TaskRegisteredEvent } from './events/task-registered.event.js';
export type { TaskRegisteredEventPayload } from './events/task-registered.event.js';
export { TaskEditedEvent } from './events/task-edited.event.js';
export type { TaskEditedEventPayload } from './events/task-edited.event.js';
export { TaskCompletedEvent } from './events/task-completed.event.js';
export type { TaskCompletedEventPayload } from './events/task-completed.event.js';
export { TaskReopenedEvent } from './events/task-reopened.event.js';
export type { TaskReopenedEventPayload } from './events/task-reopened.event.js';
export { TaskStartedEvent } from './events/task-started.event.js';
export type { TaskStartedEventPayload } from './events/task-started.event.js';
export { TaskBlockedEvent } from './events/task-blocked.event.js';
export type { TaskBlockedEventPayload } from './events/task-blocked.event.js';
export { TaskUnblockedEvent } from './events/task-unblocked.event.js';
export type { TaskUnblockedEventPayload } from './events/task-unblocked.event.js';
export { TaskCancelledEvent } from './events/task-cancelled.event.js';
export type { TaskCancelledEventPayload } from './events/task-cancelled.event.js';
export { TaskReturnedToPendingEvent } from './events/task-returned-to-pending.event.js';
export type { TaskReturnedToPendingEventPayload } from './events/task-returned-to-pending.event.js';
export { TaskDeletedEvent } from './events/task-deleted.event.js';
export type { TaskDeletedEventPayload } from './events/task-deleted.event.js';
export { TaskPriorityChangedEvent } from './events/task-priority-changed.event.js';
export type { TaskPriorityChangedEventPayload } from './events/task-priority-changed.event.js';
export { TaskDueDateChangedEvent } from './events/task-due-date-changed.event.js';
export type { TaskDueDateChangedEventPayload } from './events/task-due-date-changed.event.js';
export { TaskDuplicatedEvent } from './events/task-duplicated.event.js';
export type { TaskDuplicatedEventPayload } from './events/task-duplicated.event.js';
export { TaskRelinkedToGoalEvent } from './events/task-relinked-to-goal.event.js';
export type { TaskRelinkedToGoalEventPayload } from './events/task-relinked-to-goal.event.js';
export { TaskRelinkedToCommitmentEvent } from './events/task-relinked-to-commitment.event.js';
export type { TaskRelinkedToCommitmentEventPayload } from './events/task-relinked-to-commitment.event.js';

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
  TaskAlreadyCancelledError,
  TaskAlreadyDeletedError,
  TaskCannotBeCompletedError,
  TaskCannotBeReopenedError,
  TaskReopenBlockedByCommitmentError,
  TaskCannotBeStartedError,
  TaskCannotBeBlockedError,
  TaskCannotBeUnblockedError,
  TaskCannotBeUnblockedManuallyError,
  TaskCannotBeCancelledError,
  TaskCannotReturnToPendingError,
  InvalidTaskStateTransitionError,
  TaskNotFoundError,
  TaskDependencyCycleError,
  InvalidTaskDependencyError
} from './errors/task-errors.js';

// Constants
export { TaskConstraints } from './constants/task-constraints.js';

// TaskDependency
export { TaskDependency } from './aggregate/task-dependency.js';
export type { TaskDependencyProps } from './aggregate/task-dependency.js';
export { TaskDependencyService } from './services/task-dependency.service.js';
