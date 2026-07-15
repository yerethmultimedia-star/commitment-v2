import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DisableHabitCommand } from '../application/commands/disable-habit.command';
import { DisableHabitCommandHandlerCore } from '../application/commands/disable-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(DisableHabitCommand)
export class DisableHabitNestjsHandler implements ICommandHandler<DisableHabitCommand> {
  private readonly core: DisableHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new DisableHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: DisableHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
