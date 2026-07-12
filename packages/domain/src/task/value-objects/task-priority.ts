import { ValueObject } from '../../shared/value-object.js';
import { InvalidTaskPriorityError } from '../errors/task-errors.js';

export enum PriorityType {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export class TaskPriority extends ValueObject<{ value: PriorityType }> {
  constructor(value: PriorityType) {
    if (!TaskPriority.isValid(value)) {
      throw new InvalidTaskPriorityError(`Invalid task priority: ${value}`);
    }
    super({ value });
  }

  public get value(): PriorityType {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    return Object.values(PriorityType).includes(value as PriorityType);
  }

  public static low(): TaskPriority {
    return new TaskPriority(PriorityType.Low);
  }

  public static medium(): TaskPriority {
    return new TaskPriority(PriorityType.Medium);
  }

  public static high(): TaskPriority {
    return new TaskPriority(PriorityType.High);
  }
}
