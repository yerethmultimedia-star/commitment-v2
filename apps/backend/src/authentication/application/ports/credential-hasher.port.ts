/**
 * AR-043 Paso 3 — application Port, generic cryptographic capability, zero domain vocabulary in
 * its contract (an even clearer Port than `TokenServicePort`). Algorithm (Argon2/bcrypt) is a
 * Paso 6D implementation detail, deferred to Fase 4B.4.
 */
export interface CredentialHasherPort {
  hash(secret: string): Promise<string>;
  verify(secret: string, hash: string): Promise<boolean>;
}
