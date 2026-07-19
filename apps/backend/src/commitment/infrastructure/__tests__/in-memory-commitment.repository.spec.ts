import { InMemoryCommitmentRepository } from '../in-memory-commitment.repository';
import {
  Commitment,
  CommitmentId,
  CommitmentTitle,
  CommitmentDescription,
  IdentityId,
} from '@commitment/domain';

const ID = '018f6b5c-42e1-7000-8000-999999999999';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';

// Description is always set — Commitment Draft Lifecycle requires it for activate() to succeed.
function makeCommitment(id = ID): Commitment {
  return Commitment.register(
    new CommitmentId(id),
    new IdentityId(IDENTITY_ID),
    new CommitmentTitle('Test Title'),
    new CommitmentDescription('Test description'),
  );
}

describe('InMemoryCommitmentRepository', () => {
  it('should save and find commitment by id', async () => {
    const repository = new InMemoryCommitmentRepository();
    const id = new CommitmentId(ID);
    const commitment = makeCommitment();

    const version = await repository.save(commitment);
    expect(version).toBe(1); // 1 registered event = version 1

    const found = await repository.findById(id);
    expect(found).toBeDefined();
    expect(found?.id.equals(id)).toBe(true);
    expect(found?.title.value).toBe('Test Title');
  });

  it('should return null for non-existent id', async () => {
    const repository = new InMemoryCommitmentRepository();
    const found = await repository.findById(
      new CommitmentId('018f6b5c-42e1-7000-8000-000000000000'),
    );
    expect(found).toBeNull();
  });

  it('should increment version with each meaningful save (Rule #87)', async () => {
    const repository = new InMemoryCommitmentRepository();
    const commitment = makeCommitment();

    const v1 = await repository.save(commitment);
    expect(v1).toBe(1); // registered event

    commitment.clearUncommittedEvents();
    commitment.activate(true);
    const v2 = await repository.save(commitment);
    expect(v2).toBe(2); // activated event added

    // Idempotent save — no new events, version unchanged
    commitment.clearUncommittedEvents();
    const v3 = await repository.save(commitment);
    expect(v3).toBe(v2); // version does NOT change (Rule #87)
  });
});
