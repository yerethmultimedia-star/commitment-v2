import { ValueObject } from '../../shared/value-object.js';
import { InvalidGoalTitleError } from '../errors/goal-errors.js';
import { GoalConstraints } from '../constants/goal-constraints.js';

export class GoalTitle extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!GoalTitle.isValid(value)) {
      throw new InvalidGoalTitleError(
        `Goal title must be between 1 and ${GoalConstraints.MAX_TITLE_LENGTH} characters.`
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
    return trimmed.length >= 1 && trimmed.length <= GoalConstraints.MAX_TITLE_LENGTH;
  }
}
