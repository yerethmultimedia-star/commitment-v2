import { ValueObject } from '../../shared/value-object.js';

export class PreferredTimeZone extends ValueObject<{ name: string }> {
  constructor(name: string) {
    if (!PreferredTimeZone.isValid(name)) {
      throw new Error(`Invalid timezone name format: ${name}`);
    }
    super({ name: name.trim() });
  }

  public get name(): string {
    return this.props.name;
  }

  public static isValid(name: string): boolean {
    if (!name) return false;
    const trimmed = name.trim();
    if (trimmed === '') return false;
    const tzRegex = /^[A-Za-z0-9_+-]+(\/[A-Za-z0-9_+-]+)*$/;
    return tzRegex.test(trimmed);
  }
}
