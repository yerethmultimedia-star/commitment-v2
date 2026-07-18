import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LinkCommitmentToGoalCommand } from '../application/commands/link-commitment-to-goal.command';
import { LinkCommitmentToGoalCommandHandlerCore } from '../application/commands/link-commitment-to-goal.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import type { EventStore } from '@commitment/domain';

@CommandHandler(LinkCommitmentToGoalCommand)
export class LinkCommitmentToGoalNestjsHandler implements ICommandHandler<LinkCommitmentToGoalCommand> {
  private readonly core: LinkCommitmentToGoalCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    repository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
    @Inject('EventStore')
    eventStore: EventStore,
  ) {
    this.core = new LinkCommitmentToGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
  }

  public execute(command: LinkCommitmentToGoalCommand) {
    return this.core.handle(command);
  }
}
