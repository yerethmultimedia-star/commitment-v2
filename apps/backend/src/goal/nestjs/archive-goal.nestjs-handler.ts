import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ArchiveGoalCommand } from '../application/commands/archive-goal.command';
import { ArchiveGoalCommandHandlerCore } from '../application/commands/archive-goal.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(ArchiveGoalCommand)
export class ArchiveGoalNestjsHandler implements ICommandHandler<ArchiveGoalCommand> {
  private readonly core: ArchiveGoalCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    repository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
  ) {
    this.core = new ArchiveGoalCommandHandlerCore(repository, dispatcher);
  }

  public execute(command: ArchiveGoalCommand) {
    return this.core.handle(command);
  }
}
