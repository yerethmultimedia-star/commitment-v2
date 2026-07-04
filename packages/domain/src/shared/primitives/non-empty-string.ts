import { ValueObject } from '../value-object.js';

export class NonEmptyString extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Value must be a non-empty string.');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
