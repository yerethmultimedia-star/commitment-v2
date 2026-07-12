import { ValueObject } from '../../shared/value-object.js';
import { InvalidTaskTitleError } from '../errors/task-errors.js';
import { TaskConstraints } from '../constants/task-constraints.js';

export class TaskTitle extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!TaskTitle.isValid(value)) {
      throw new InvalidTaskTitleError(
        `Task title must be between 1 and ${TaskConstraints.MAX_TITLE_LENGTH} characters.`
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
    return trimmed.length >= 1 && trimmed.length <= TaskConstraints.MAX_TITLE_LENGTH;
  }
}
