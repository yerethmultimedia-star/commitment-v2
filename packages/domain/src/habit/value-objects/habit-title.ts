import { ValueObject } from '../../shared/value-object.js';
import { InvalidHabitTitleError } from '../errors/habit-errors.js';
import { HabitConstraints } from '../constants/habit-constraints.js';

export class HabitTitle extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!HabitTitle.isValid(value)) {
      throw new InvalidHabitTitleError(
        `Habit title must be between 1 and ${HabitConstraints.MAX_TITLE_LENGTH} characters.`
      );
    }
    super({ value: value.trim() });
  }

  public get value(): string {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed.length >= 1 && trimmed.length <= HabitConstraints.MAX_TITLE_LENGTH;
  }
}
