import { ValueObject } from '../value-object.js';

export class PositiveNumber extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0) {
      throw new Error('Value must be a positive number.');
    }
    super({ value });
  }

  public get value(): number {
    return this.props.value;
  }
}
