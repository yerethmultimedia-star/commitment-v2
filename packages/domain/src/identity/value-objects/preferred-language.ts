import { ValueObject } from '../../shared/value-object.js';

export class PreferredLanguage extends ValueObject<{ code: string }> {
  constructor(code: string) {
    if (!PreferredLanguage.isValid(code)) {
      throw new Error(`Invalid language locale BCP-47: ${code}`);
    }
    super({ code: code.trim() });
  }

  public get code(): string {
    return this.props.code;
  }

  public static isValid(code: string): boolean {
    if (!code) return false;
    const bcp47Regex = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,4})*$/;
    return bcp47Regex.test(code.trim());
  }
}
