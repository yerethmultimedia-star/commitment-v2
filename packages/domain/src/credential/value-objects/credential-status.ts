import { ValueObject } from '../../shared/value-object.js';

/** AR-043 Paso 1/Paso 6A — deliberately just Active/Blocked today; no Pending/ResetRequired yet. */
export enum CredentialStatusType {
  Active = 'active',
  Blocked = 'blocked',
}

export class CredentialStatus extends ValueObject<{ value: CredentialStatusType }> {
  constructor(value: CredentialStatusType) {
    if (!CredentialStatus.isValid(value)) {
      throw new Error(`Invalid credential status: ${value}`);
    }
    super({ value });
  }

  public get value(): CredentialStatusType {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    return Object.values(CredentialStatusType).includes(value as CredentialStatusType);
  }

  public static active(): CredentialStatus {
    return new CredentialStatus(CredentialStatusType.Active);
  }

  public static blocked(): CredentialStatus {
    return new CredentialStatus(CredentialStatusType.Blocked);
  }
}
