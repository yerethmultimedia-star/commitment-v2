export class HabitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidHabitTitleError extends HabitError {}
export class InvalidHabitRecurrenceError extends HabitError {}
export class InvalidHabitReminderTimeError extends HabitError {}
export class InvalidPostponeDurationError extends HabitError {}
export class HabitAlreadyArchivedError extends HabitError {}
export class HabitCannotBeEditedError extends HabitError {}
export class HabitNotFoundError extends HabitError {}
