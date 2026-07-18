import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateGoalDescriptionCommand } from '../application/commands/update-goal-description.command';
import { UpdateGoalDescriptionCommandHandlerCore } from '../application/commands/update-goal-description.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import type { EventStore } from '@commitment/domain';

@CommandHandler(UpdateGoalDescriptionCommand)
export class UpdateGoalDescriptionNestjsHandler implements ICommandHandler<UpdateGoalDescriptionCommand> {
  private readonly core: UpdateGoalDescriptionCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    repository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
    @Inject('EventStore')
    eventStore: EventStore,
  ) {
    this.core = new UpdateGoalDescriptionCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
  }

  public execute(command: UpdateGoalDescriptionCommand) {
    return this.core.handle(command);
  }
}
