import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterHabitCommand } from '../application/commands/register-habit.command';
import { RegisterHabitCommandHandlerCore } from '../application/commands/register-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(RegisterHabitCommand)
export class RegisterHabitNestjsHandler implements ICommandHandler<RegisterHabitCommand> {
  private readonly core: RegisterHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new RegisterHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: RegisterHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
