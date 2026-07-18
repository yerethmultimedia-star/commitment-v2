import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CompleteGoalCommand } from '../application/commands/complete-goal.command';
import { CompleteGoalCommandHandlerCore } from '../application/commands/complete-goal.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import type { EventStore } from '@commitment/domain';

@CommandHandler(CompleteGoalCommand)
export class CompleteGoalNestjsHandler implements ICommandHandler<CompleteGoalCommand> {
  private readonly core: CompleteGoalCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    repository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
    @Inject('EventStore')
    eventStore: EventStore,
  ) {
    this.core = new CompleteGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
  }

  public execute(command: CompleteGoalCommand) {
    return this.core.handle(command);
  }
}
