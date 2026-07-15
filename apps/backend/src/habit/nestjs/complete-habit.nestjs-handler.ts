import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CompleteHabitCommand } from '../application/commands/complete-habit.command';
import { CompleteHabitCommandHandlerCore } from '../application/commands/complete-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(CompleteHabitCommand)
export class CompleteHabitNestjsHandler implements ICommandHandler<CompleteHabitCommand> {
  private readonly core: CompleteHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new CompleteHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: CompleteHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
