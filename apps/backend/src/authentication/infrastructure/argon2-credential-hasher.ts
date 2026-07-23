import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CredentialHasherPort } from '../application/ports/credential-hasher.port';

/**
 * AR-043 Paso 6D — the only file in the codebase allowed to import `argon2`. The domain never
 * sees this algorithm choice: `Credential.credentialHash` is an opaque string to everything
 * outside this class.
 */
@Injectable()
export class Argon2CredentialHasher implements CredentialHasherPort {
  public async hash(secret: string): Promise<string> {
    return argon2.hash(secret);
  }

  public async verify(secret: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, secret);
    } catch {
      return false;
    }
  }
}
