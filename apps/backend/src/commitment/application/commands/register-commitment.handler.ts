import {
  CommitmentId,
  CommitmentTitle,
  CommitmentDescription,
  Commitment,
  IdentityId,
  RecurrencePattern,
  RecurrenceType,
  SeriesId,
  TargetDate,
} from '@commitment/domain';
import { RegisterCommitmentCommand } from './register-commitment.command';
import { RegisterCommitmentResult } from './register-commitment.result';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';
import { VersionedCommitmentRepository } from '../ports/versioned-commitment-repository.port';

export class RegisterCommitmentCommandHandlerCore {
  constructor(
    private readonly commitmentRepository: VersionedCommitmentRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: RegisterCommitmentCommand,
  ): Promise<RegisterCommitmentResult> {
    // 1. Idempotency Check
    const id = new CommitmentId(command.id);
    const existing = await this.commitmentRepository.findById(id);
    if (existing) {
      // Return existing details idempotently — version does NOT increment (Rule #87)
      const version = await this.commitmentRepository.save(existing);
      return new RegisterCommitmentResult(existing.id.value, version);
    }

    // 2. Translate Primitives into Domain Value Objects
    const identityId = new IdentityId(command.identityId);
    const title = new CommitmentTitle(command.title);
    const description = command.description
      ? new CommitmentDescription(command.description)
      : null;
    const pattern = command.recurrencePattern
      ? RecurrencePattern.create(command.recurrencePattern as RecurrenceType)
      : undefined;
    const targetDate = command.targetDate
      ? TargetDate.create(command.targetDate)
      : undefined;
    const seriesId = command.seriesId
      ? SeriesId.create(command.seriesId)
      : undefined;

    // 3. Invoke Domain Aggregate Behavior
    const commitment: Commitment = Commitment.register(
      id,
      identityId,
      title,
      description,
      pattern,
      targetDate,
      seriesId,
    );

    // 4. Save to Repository — receive actual version
    const version = await this.commitmentRepository.save(commitment);

    // 5. Dispatch Primary Events & Clear Event Buffer
    const events = commitment.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    commitment.clearUncommittedEvents();

    return new RegisterCommitmentResult(commitment.id.value, version);
  }
}
