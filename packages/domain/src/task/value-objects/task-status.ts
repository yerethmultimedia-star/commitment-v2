import { ValueObject } from '../../shared/value-object.js';
import { InvalidTaskStatusError } from '../errors/task-errors.js';

export enum StatusType {
  Pending = 'pending',
  Completed = 'completed',
  Archived = 'archived',
}

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

  public static completed(): TaskStatus {
    return new TaskStatus(StatusType.Completed);
  }

  public static archived(): TaskStatus {
    return new TaskStatus(StatusType.Archived);
  }
}
