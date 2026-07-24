import { Injectable } from '@nestjs/common';
import { Identity, IdentityId, IdentityRepository } from '@commitment/domain';

@Injectable()
export class InMemoryIdentityRepository implements IdentityRepository {
  private readonly identities = new Map<string, Identity>();

  public async save(identity: Identity): Promise<void> {
    await Promise.resolve();
    this.identities.set(identity.id.value, identity);
  }

  public async findById(id: IdentityId): Promise<Identity | null> {
    await Promise.resolve();
    return this.identities.get(id.value) || null;
  }
}
