import { ValueObject } from '../value-object.js';

export class Email extends ValueObject<{ value: string }> {
  constructor(value: string) {
    const trimmed = (value || '').trim();
    if (!Email.isValid(trimmed)) {
      throw new Error(`Invalid email address format: ${value}`);
    }
    super({ value: trimmed.toLowerCase() });
  }

  public get value(): string {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    if (!value) return false;
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }
}
