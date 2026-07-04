import { ValueObject } from '../../shared/value-object.js';
import { InvalidCommitmentTitleError } from '../errors/commitment-errors.js';
import { CommitmentConstraints } from '../constants/commitment-constraints.js';

export class CommitmentTitle extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!CommitmentTitle.isValid(value)) {
      throw new InvalidCommitmentTitleError(
        `Commitment title must be between 1 and ${CommitmentConstraints.MAX_TITLE_LENGTH} characters.`
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
    return trimmed.length >= 1 && trimmed.length <= CommitmentConstraints.MAX_TITLE_LENGTH;
  }
}
