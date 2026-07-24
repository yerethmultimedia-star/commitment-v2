import { InMemoryIdentityRepository } from './in-memory-identity.repository';
import {
  Identity,
  IdentityId,
  Email,
  DisplayName,
  PreferredLanguage,
  PreferredTimeZone,
} from '@commitment/domain';

describe('InMemoryIdentityRepository', () => {
  it('persists and retrieves the same Identity aggregate by id', async () => {
    const repository = new InMemoryIdentityRepository();
    const id = new IdentityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    const identity = Identity.register(
      id,
      new Email('user@example.com'),
      new DisplayName('Alice Smith'),
      new PreferredLanguage('en'),
      new PreferredTimeZone('UTC'),
      new Date(),
    );

    await repository.save(identity);
    const found = await repository.findById(id);

    expect(found).not.toBeNull();
    expect(found?.id.equals(id)).toBe(true);
    expect(found?.email.value).toBe('user@example.com');
  });

  it('returns null for an identity that was never registered', async () => {
    const repository = new InMemoryIdentityRepository();
    const unknownId = new IdentityId('00000000-0000-0000-0000-000000000099');

    await expect(repository.findById(unknownId)).resolves.toBeNull();
  });
});
