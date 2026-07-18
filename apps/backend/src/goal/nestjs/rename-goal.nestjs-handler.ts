import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RenameGoalCommand } from '../application/commands/rename-goal.command';
import { RenameGoalCommandHandlerCore } from '../application/commands/rename-goal.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import type { EventStore } from '@commitment/domain';

@CommandHandler(RenameGoalCommand)
export class RenameGoalNestjsHandler implements ICommandHandler<RenameGoalCommand> {
  private readonly core: RenameGoalCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    repository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
    @Inject('EventStore')
    eventStore: EventStore,
  ) {
    this.core = new RenameGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
  }

  public execute(command: RenameGoalCommand) {
    return this.core.handle(command);
  }
}
