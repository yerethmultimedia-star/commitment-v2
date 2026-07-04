import { ValueObject } from '../../shared/value-object.js';

export class DisplayName extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!DisplayName.isValid(value)) {
      throw new Error('Display name must be between 1 and 100 characters.');
    }
    super({ value: value.trim() });
  }

  public get value(): string {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed.length >= 1 && trimmed.length <= 100;
  }
}
