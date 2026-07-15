// Aggregate
export { Habit, HabitState } from './aggregate/habit.js';
export type { HabitProps } from './aggregate/habit.js';

// Value Objects
export { HabitId } from './value-objects/habit-id.js';
export { HabitTitle } from './value-objects/habit-title.js';
export { HabitRecurrence, HabitRecurrenceType } from './value-objects/habit-recurrence.js';
export { HabitReminderTime } from './value-objects/habit-reminder-time.js';

// Events
export { HabitRegisteredEvent } from './events/habit-registered.event.js';
export type { HabitRegisteredEventPayload } from './events/habit-registered.event.js';
export { HabitEditedEvent } from './events/habit-edited.event.js';
export type { HabitEditedEventPayload } from './events/habit-edited.event.js';
export { HabitCompletedEvent } from './events/habit-completed.event.js';
export type { HabitCompletedEventPayload } from './events/habit-completed.event.js';
export { HabitUncompletedEvent } from './events/habit-uncompleted.event.js';
export type { HabitUncompletedEventPayload } from './events/habit-uncompleted.event.js';
export { HabitPostponedEvent } from './events/habit-postponed.event.js';
export type { HabitPostponedEventPayload } from './events/habit-postponed.event.js';
export { HabitOccurrenceMissedEvent } from './events/habit-occurrence-missed.event.js';
export type { HabitOccurrenceMissedEventPayload } from './events/habit-occurrence-missed.event.js';
export { HabitEnabledEvent } from './events/habit-enabled.event.js';
export type { HabitEnabledEventPayload } from './events/habit-enabled.event.js';
export { HabitDisabledEvent } from './events/habit-disabled.event.js';
export type { HabitDisabledEventPayload } from './events/habit-disabled.event.js';
export { HabitArchivedEvent } from './events/habit-archived.event.js';
export type { HabitArchivedEventPayload } from './events/habit-archived.event.js';

// Repository
export type { HabitRepository } from './repositories/habit-repository.interface.js';

// Errors
export {
  HabitError,
  InvalidHabitTitleError,
  InvalidHabitRecurrenceError,
  InvalidHabitReminderTimeError,
  InvalidPostponeDurationError,
  HabitAlreadyArchivedError,
  HabitCannotBeEditedError,
  HabitNotFoundError,
} from './errors/habit-errors.js';

// Constants
export { HabitConstraints } from './constants/habit-constraints.js';

// Read model
export type { HabitSummary } from './models/habit-summary.model.js';

// Engine
export type { HabitRecurrenceDescriptor } from './engine/habit-recurrence-descriptor.type.js';
export { isHabitDueOn } from './engine/is-habit-due-on.js';
export { computeNextOccurrence } from './engine/compute-next-occurrence.js';
export type { ReminderTimeOfDay } from './engine/compute-next-occurrence.js';
export { computeHabitStreak } from './engine/compute-habit-streak.js';
export type { ComputeHabitStreakInput, ComputeHabitStreakResult } from './engine/compute-habit-streak.js';
export { describeHabitRecurrence } from './engine/describe-habit-recurrence.js';
export type { HabitRecurrenceLabel, HabitRecurrenceLabelKind } from './engine/describe-habit-recurrence.js';
