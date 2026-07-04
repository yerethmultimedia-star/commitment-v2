export class UniqueEntityId {
  private readonly _value: string;

  constructor(value: string) {
    if (!UniqueEntityId.isValid(value)) {
      throw new Error(`Invalid UniqueEntityId value: ${value}`);
    }
    this._value = value;
    Object.freeze(this);
  }

  public get value(): string {
    return this._value;
  }

  public equals(id?: UniqueEntityId): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    return this._value === id.value;
  }

  public static isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
