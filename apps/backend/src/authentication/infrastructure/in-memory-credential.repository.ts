import { Injectable } from '@nestjs/common';
import { Credential, CredentialRepository } from '@commitment/domain';

@Injectable()
export class InMemoryCredentialRepository implements CredentialRepository {
  private readonly credentials = new Map<string, Credential>();

  public async save(credential: Credential): Promise<void> {
    await Promise.resolve();
    this.credentials.set(credential.id, credential);
  }

  public async findById(credentialId: string): Promise<Credential | null> {
    await Promise.resolve();
    return this.credentials.get(credentialId) || null;
  }

  public async findByLoginIdentifier(
    loginIdentifier: string,
  ): Promise<Credential | null> {
    await Promise.resolve();
    for (const credential of this.credentials.values()) {
      if (credential.loginIdentifier === loginIdentifier) {
        return credential;
      }
    }
    return null;
  }
}
