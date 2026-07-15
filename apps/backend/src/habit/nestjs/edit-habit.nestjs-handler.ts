import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EditHabitCommand } from '../application/commands/edit-habit.command';
import { EditHabitCommandHandlerCore } from '../application/commands/edit-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(EditHabitCommand)
export class EditHabitNestjsHandler implements ICommandHandler<EditHabitCommand> {
  private readonly core: EditHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new EditHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: EditHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
