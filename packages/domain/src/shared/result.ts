import { DomainError } from './domain-error.js';

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value: T | null;
  private readonly _error: DomainError | null;

  private constructor(isSuccess: boolean, value: T | null, error: DomainError | null) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._value = value;
    this._error = error;
    Object.freeze(this);
  }

  public get value(): T {
    if (this.isFailure) {
      throw new Error('Cannot retrieve value from a failed Result.');
    }
    return this._value as T;
  }

  public get error(): DomainError {
    if (this.isSuccess || !this._error) {
      throw new Error('Cannot retrieve error from a successful Result.');
    }
    return this._error;
  }

  public static ok(): Result<void>;
  public static ok<U>(value: U): Result<U>;
  public static ok<U>(value?: U): Result<U | void> {
    return new Result<U | void>(true, value, null);
  }

  public static fail<U>(error: DomainError): Result<U> {
    return new Result<U>(false, null, error);
  }
}
