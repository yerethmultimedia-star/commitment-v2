import { ValueObject } from '../../shared/value-object.js';
import { InvalidCommitmentDescriptionError } from '../errors/commitment-errors.js';
import { CommitmentConstraints } from '../constants/commitment-constraints.js';

export class CommitmentDescription extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!CommitmentDescription.isValid(value)) {
      throw new InvalidCommitmentDescriptionError(
        `Commitment description must not exceed ${CommitmentConstraints.MAX_DESCRIPTION_LENGTH} characters.`
      );
    }
    super({ value: value ? value.trim() : '' });
  }

  public get value(): string {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    if (value === null || value === undefined) return true;
    const trimmed = value.trim();
    return trimmed.length <= CommitmentConstraints.MAX_DESCRIPTION_LENGTH;
  }
}
