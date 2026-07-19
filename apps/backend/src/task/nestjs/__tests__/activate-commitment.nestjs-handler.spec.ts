import { ActivateCommitmentNestjsHandler } from '../activate-commitment.nestjs-handler';
import { ActivateCommitmentCommand } from '../../../commitment/application/commands/activate-commitment.command';
import { InMemoryCommitmentRepository } from '../../../commitment/infrastructure/in-memory-commitment.repository';
import { NoOpDomainEventDispatcher } from '../../../commitment/infrastructure/noop-event-dispatcher';
import type { CommitmentActivationPreconditions } from '../../../commitment/application/ports/commitment-activation-preconditions.port';
import {
  Commitment,
  CommitmentId,
  CommitmentTitle,
  CommitmentDescription,
  IdentityId,
} from '@commitment/domain';

describe('ActivateCommitmentNestjsHandler', () => {
  it('should delegate to core handler and return ActivateCommitmentResult', async () => {
    const repository = new InMemoryCommitmentRepository();
    const dispatcher = new NoOpDomainEventDispatcher();
    // ADR-022 §3.1 — stubbed to satisfy the precondition; this test covers
    // NestJS wiring, not the execution-plan requirement itself.
    const activationPreconditions: CommitmentActivationPreconditions = {
      hasExecutionPlan: () => Promise.resolve(true),
    };
    const handler = new ActivateCommitmentNestjsHandler(
      repository,
      dispatcher,
      activationPreconditions,
    );

    // Pre-seed a commitment
    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const commitment = Commitment.register(
      new CommitmentId(id),
      new IdentityId('018f6b5c-42e1-7000-8000-111111111111'),
      new CommitmentTitle('Test'),
      new CommitmentDescription('Test description'),
    );
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    const result = (await handler.execute(
      new ActivateCommitmentCommand(id),
    )) as {
      commitmentId: string;
      state: string;
      version: number;
    };

    expect(result.commitmentId).toBe(id);
    expect(result.state).toBe('Active');
    expect(result.version).toBe(2); // register event (1) + activate event (1) = 2
  });
});
