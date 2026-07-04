import {
  Commitment,
  CommitmentId,
  CommitmentTitle,
  CommitmentDescription,
  CommitmentRepository,
  IdentityId,
} from '@commitment/domain';
import { RegisterCommitmentCommand } from './register-commitment.command';
import { RegisterCommitmentResult } from './register-commitment.result';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';

export class RegisterCommitmentCommandHandlerCore {
  constructor(
    private readonly commitmentRepository: CommitmentRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: RegisterCommitmentCommand,
  ): Promise<RegisterCommitmentResult> {
    // 1. Idempotency Check
    const id = new CommitmentId(command.id);
    const existing = await this.commitmentRepository.findById(id);
    if (existing) {
      // Return existing details idempotently
      return new RegisterCommitmentResult(existing.id.value, 1);
    }

    // 2. Translate Primitives into Domain Value Objects
    const identityId = new IdentityId(command.identityId);
    const title = new CommitmentTitle(command.title);
    const description = command.description
      ? new CommitmentDescription(command.description)
      : null;

    // 3. Invoke Domain Aggregate Behavior
    const commitment = Commitment.register(id, identityId, title, description);

    // 4. Save to Repository
    await this.commitmentRepository.save(commitment);

    // 5. Dispatch Primary Events & Clear Event Buffer
    const events = commitment.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    commitment.clearUncommittedEvents();

    return new RegisterCommitmentResult(commitment.id.value, 1);
  }
}
