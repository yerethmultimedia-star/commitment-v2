import { ValueObject } from '../../shared/value-object.js';
import { PriorityType } from '../../task/value-objects/task-priority.js';
import { InvalidCommitmentPriorityError } from '../errors/commitment-errors.js';

/**
 * Same finite set of levels as TaskPriority (reuses PriorityType rather than
 * redefining it) — priority means the same thing across Commitments and
 * Tasks in this product, just scoped to a different aggregate's identity.
 */
export class CommitmentPriority extends ValueObject<{ value: PriorityType }> {
  constructor(value: PriorityType) {
    if (!CommitmentPriority.isValid(value)) {
      throw new InvalidCommitmentPriorityError(`Invalid commitment priority: ${value}`);
    }
    super({ value });
  }

  public get value(): PriorityType {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    return Object.values(PriorityType).includes(value as PriorityType);
  }

  public static low(): CommitmentPriority {
    return new CommitmentPriority(PriorityType.Low);
  }

  public static medium(): CommitmentPriority {
    return new CommitmentPriority(PriorityType.Medium);
  }

  public static high(): CommitmentPriority {
    return new CommitmentPriority(PriorityType.High);
  }
}
