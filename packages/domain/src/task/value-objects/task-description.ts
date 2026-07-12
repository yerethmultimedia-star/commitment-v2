import { ValueObject } from '../../shared/value-object.js';
import { InvalidTaskDescriptionError } from '../errors/task-errors.js';
import { TaskConstraints } from '../constants/task-constraints.js';

export class TaskDescription extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!TaskDescription.isValid(value)) {
      throw new InvalidTaskDescriptionError(
        `Task description must not exceed ${TaskConstraints.MAX_DESCRIPTION_LENGTH} characters.`
      );
    }
    super({ value: value.trim() });
  }

  public get value(): string {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    if (value === undefined || value === null) return true;
    const trimmed = value.trim();
    return trimmed.length <= TaskConstraints.MAX_DESCRIPTION_LENGTH;
  }
}
