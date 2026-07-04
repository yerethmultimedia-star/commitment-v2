import { ValueObject } from '../value-object.js';

export class Email extends ValueObject<{ value: string }> {
  constructor(value: string) {
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
