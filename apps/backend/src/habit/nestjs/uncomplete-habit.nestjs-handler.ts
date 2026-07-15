import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UncompleteHabitCommand } from '../application/commands/uncomplete-habit.command';
import { UncompleteHabitCommandHandlerCore } from '../application/commands/uncomplete-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(UncompleteHabitCommand)
export class UncompleteHabitNestjsHandler implements ICommandHandler<UncompleteHabitCommand> {
  private readonly core: UncompleteHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new UncompleteHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: UncompleteHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
