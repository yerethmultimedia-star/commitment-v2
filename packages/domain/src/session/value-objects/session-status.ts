import { ValueObject } from '../../shared/value-object.js';

/** AR-043 Paso 1/Paso 6A — Active/Revoked/Expired are distinct invariants (revoked = explicit action,
 * expired = elapsed time); collapsing them into one boolean was rejected during Fase 4A. */
export enum SessionStatusType {
  Active = 'active',
  Revoked = 'revoked',
  Expired = 'expired',
}

export class SessionStatus extends ValueObject<{ value: SessionStatusType }> {
  constructor(value: SessionStatusType) {
    if (!SessionStatus.isValid(value)) {
      throw new Error(`Invalid session status: ${value}`);
    }
    super({ value });
  }

  public get value(): SessionStatusType {
    return this.props.value;
  }

  public static isValid(value: string): boolean {
    return Object.values(SessionStatusType).includes(value as SessionStatusType);
  }

  public static active(): SessionStatus {
    return new SessionStatus(SessionStatusType.Active);
  }

  public static revoked(): SessionStatus {
    return new SessionStatus(SessionStatusType.Revoked);
  }

  public static expired(): SessionStatus {
    return new SessionStatus(SessionStatusType.Expired);
  }
}
