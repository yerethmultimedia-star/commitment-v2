/**
 * AR-043 Paso 3/H-043.5 — application Port, not a domain service (same category as
 * `ReminderSchedulerPort`: contract in domain vocabulary, implementation depends on external
 * technical capability). JWT is an implementation detail behind this contract (Paso 6A/6C,
 * H-043.9) — nothing here mentions JWT, claims, or HTTP.
 */
export interface VerifiedToken {
  readonly sessionId: string;
  readonly identityId: string;
}

export interface TokenServicePort {
  issue(
    sessionId: string,
    identityId: string,
    expiresAt: Date,
  ): Promise<string>;
  verify(token: string): Promise<VerifiedToken | null>;
}
