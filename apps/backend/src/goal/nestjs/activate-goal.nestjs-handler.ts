import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ActivateGoalCommand } from '../application/commands/activate-goal.command';
import { ActivateGoalCommandHandlerCore } from '../application/commands/activate-goal.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import type { EventStore } from '@commitment/domain';

@CommandHandler(ActivateGoalCommand)
export class ActivateGoalNestjsHandler implements ICommandHandler<ActivateGoalCommand> {
  private readonly core: ActivateGoalCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    repository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
    @Inject('EventStore')
    eventStore: EventStore,
  ) {
    this.core = new ActivateGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
  }

  public execute(command: ActivateGoalCommand) {
    return this.core.handle(command);
  }
}
