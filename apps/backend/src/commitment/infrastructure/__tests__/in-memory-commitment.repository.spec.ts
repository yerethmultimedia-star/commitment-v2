import { InMemoryCommitmentRepository } from '../in-memory-commitment.repository';
import {
  Commitment,
  CommitmentId,
  CommitmentTitle,
  CommitmentDescription,
  IdentityId,
} from '@commitment/domain';
import { OptimisticConcurrencyError } from '../../../infrastructure/errors/optimistic-concurrency.error';

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

  describe('AR-028 — optimistic concurrency', () => {
    it('persists exactly aggregate.version at every step — never recomputed via addition', async () => {
      const repository = new InMemoryCommitmentRepository();
      const commitment = makeCommitment();

      const v1 = await repository.save(commitment);
      expect(v1).toBe(commitment.version);
      commitment.clearUncommittedEvents();

      commitment.rename(new CommitmentTitle('Renamed'));
      const v2 = await repository.save(commitment);
      expect(v2).toBe(commitment.version);
      commitment.clearUncommittedEvents();

      commitment.activate(true);
      const v3 = await repository.save(commitment);
      expect(v3).toBe(commitment.version);
    });

    it('throws OptimisticConcurrencyError when a stale copy is saved after a concurrent write', async () => {
      const repository = new InMemoryCommitmentRepository();
      const id = new CommitmentId(ID);

      // "Session A" registers and persists the aggregate.
      const sessionA = makeCommitment();
      await repository.save(sessionA);
      const registeredEvent = sessionA.getUncommittedEvents()[0];
      sessionA.clearUncommittedEvents();

      // "Session B" independently loads the same aggregate at the same
      // version — a distinct object instance, simulating a concurrent
      // request/process, not a shared reference.
      const sessionB = Commitment.register(
        id,
        new IdentityId(IDENTITY_ID),
        new CommitmentTitle('Throwaway'),
        null,
      );
      sessionB.loadFromHistory([registeredEvent]);
      sessionB.clearUncommittedEvents();

      // Session A mutates and saves first — succeeds.
      sessionA.rename(new CommitmentTitle('A wins'));
      await repository.save(sessionA);

      // Session B, unaware of A's write, mutates its now-stale copy and
      // tries to save — must be rejected, not silently overwrite A's write.
      sessionB.rename(new CommitmentTitle('B is stale'));
      await expect(repository.save(sessionB)).rejects.toThrow(
        OptimisticConcurrencyError,
      );
    });
  });
});
