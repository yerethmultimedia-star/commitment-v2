import { ValueObject } from '../value-object.js';

export class Percentage extends ValueObject<{ value: number }> {
  constructor(value: number) {
    super({ value });
  }

  public get value(): number {
    return this.props.value;
  }
}
