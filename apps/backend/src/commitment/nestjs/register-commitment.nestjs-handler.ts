import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterCommitmentCommand } from '../application/commands/register-commitment.command';
import { RegisterCommitmentCommandHandlerCore } from '../application/commands/register-commitment.handler';
import type { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import type { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@CommandHandler(RegisterCommitmentCommand)
export class RegisterCommitmentNestjsHandler implements ICommandHandler<RegisterCommitmentCommand> {
  private readonly core: RegisterCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    private readonly commitmentRepository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    private readonly eventDispatcher: DomainEventDispatcher,
    @InjectMetric('commitments_created_total')
    private readonly commitmentsCounter: Counter<string>,
  ) {
    this.core = new RegisterCommitmentCommandHandlerCore(
      this.commitmentRepository,
      this.eventDispatcher,
      this.commitmentsCounter,
    );
  }

  async execute(command: RegisterCommitmentCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
