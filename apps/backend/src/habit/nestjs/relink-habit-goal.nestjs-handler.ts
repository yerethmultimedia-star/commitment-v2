import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RelinkHabitGoalCommand } from '../application/commands/relink-habit-goal.command';
import { RelinkHabitGoalCommandHandlerCore } from '../application/commands/relink-habit-goal.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(RelinkHabitGoalCommand)
export class RelinkHabitGoalNestjsHandler implements ICommandHandler<RelinkHabitGoalCommand> {
  private readonly core: RelinkHabitGoalCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new RelinkHabitGoalCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: RelinkHabitGoalCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
