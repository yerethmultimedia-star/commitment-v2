import { Repository } from '../../shared/repository.interface.js';
import { Identity } from '../aggregate/identity.js';
import { IdentityId } from '../value-objects/identity-id.js';

export interface IdentityRepository extends Repository<Identity> {
  save(identity: Identity): Promise<void>;
  findById(id: IdentityId): Promise<Identity | null>;
}
