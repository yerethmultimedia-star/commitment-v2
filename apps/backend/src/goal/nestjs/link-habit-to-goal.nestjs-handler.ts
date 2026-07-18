import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LinkHabitToGoalCommand } from '../application/commands/link-habit-to-goal.command';
import { LinkHabitToGoalCommandHandlerCore } from '../application/commands/link-habit-to-goal.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(LinkHabitToGoalCommand)
export class LinkHabitToGoalNestjsHandler implements ICommandHandler<LinkHabitToGoalCommand> {
  private readonly core: LinkHabitToGoalCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    repository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
  ) {
    this.core = new LinkHabitToGoalCommandHandlerCore(repository, dispatcher);
  }

  public execute(command: LinkHabitToGoalCommand) {
    return this.core.handle(command);
  }
}
