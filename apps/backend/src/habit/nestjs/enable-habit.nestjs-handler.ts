import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EnableHabitCommand } from '../application/commands/enable-habit.command';
import { EnableHabitCommandHandlerCore } from '../application/commands/enable-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(EnableHabitCommand)
export class EnableHabitNestjsHandler implements ICommandHandler<EnableHabitCommand> {
  private readonly core: EnableHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new EnableHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: EnableHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
