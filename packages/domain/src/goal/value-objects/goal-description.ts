import { ValueObject } from '../../shared/value-object.js';
import { InvalidGoalDescriptionError } from '../errors/goal-errors.js';
import { GoalConstraints } from '../constants/goal-constraints.js';

export class GoalDescription extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!GoalDescription.isValid(value)) {
      throw new InvalidGoalDescriptionError(
        `Goal description must be at most ${GoalConstraints.MAX_DESCRIPTION_LENGTH} characters.`
      );
    }
    super({ value: value.trim() });
  }

  public get value(): string {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    if (value === null || value === undefined) return false;
    return value.trim().length <= GoalConstraints.MAX_DESCRIPTION_LENGTH;
  }
}
