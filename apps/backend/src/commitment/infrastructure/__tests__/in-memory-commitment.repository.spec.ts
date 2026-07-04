import { InMemoryCommitmentRepository } from '../in-memory-commitment.repository';
import {
  Commitment,
  CommitmentId,
  CommitmentTitle,
  IdentityId,
} from '@commitment/domain';

describe('InMemoryCommitmentRepository', () => {
  it('should save and find commitment by id', async () => {
    const repository = new InMemoryCommitmentRepository();
    const id = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
    const identityId = new IdentityId('018f6b5c-42e1-7000-8000-111111111111');
    const commitment = Commitment.register(
      id,
      identityId,
      new CommitmentTitle('Test Title'),
      null,
    );

    await repository.save(commitment);
    const found = await repository.findById(id);

    expect(found).toBeDefined();
    expect(found?.id.equals(id)).toBe(true);
    expect(found?.title.value).toBe('Test Title');

    const nonExistent = await repository.findById(
      new CommitmentId('018f6b5c-42e1-7000-8000-000000000000'),
    );
    expect(nonExistent).toBeNull();
  });
});
