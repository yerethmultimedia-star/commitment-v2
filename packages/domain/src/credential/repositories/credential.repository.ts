import { Credential } from '../aggregate/credential.js';

export interface CredentialRepository {
  save(credential: Credential): Promise<void>;
  findById(credentialId: string): Promise<Credential | null>;
  findByLoginIdentifier(loginIdentifier: string): Promise<Credential | null>;
}
