import { ValueObject } from '../../shared/value-object.js';
import { InvalidTaskStatusError } from '../errors/task-errors.js';

/**
 * Task Lifecycle & Execution Model (ADR-022). `Archived` was removed —
 * existing `archived` data migrates to `Cancelled`. `Deferred` was
 * considered and rejected in V-001; never added here.
 */
export enum StatusType {
  Pending = 'pending',
  InProgress = 'in_progress',
  Blocked = 'blocked',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

/**
 * `manual` — user-initiated, can only be unblocked manually.
 * `dependency` — set automatically when a predecessor Task isn't Completed;
 * can ONLY be unblocked automatically, when that predecessor completes
 * (ADR-022 §4.2). Never both at once — Unblock's own guard enforces this.
 */
export type BlockedType = 'manual' | 'dependency';

export class TaskStatus extends ValueObject<{ value: StatusType }> {
  constructor(value: StatusType) {
    if (!TaskStatus.isValid(value)) {
      throw new InvalidTaskStatusError(`Invalid task status: ${value}`);
    }
    super({ value });
  }

  public get value(): StatusType {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    return Object.values(StatusType).includes(value as StatusType);
  }

  public static pending(): TaskStatus {
    return new TaskStatus(StatusType.Pending);
  }

  public static inProgress(): TaskStatus {
    return new TaskStatus(StatusType.InProgress);
  }

  public static blocked(): TaskStatus {
    return new TaskStatus(StatusType.Blocked);
  }

  public static completed(): TaskStatus {
    return new TaskStatus(StatusType.Completed);
  }

  public static cancelled(): TaskStatus {
    return new TaskStatus(StatusType.Cancelled);
  }
}
