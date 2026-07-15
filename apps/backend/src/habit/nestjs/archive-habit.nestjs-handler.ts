import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ArchiveHabitCommand } from '../application/commands/archive-habit.command';
import { ArchiveHabitCommandHandlerCore } from '../application/commands/archive-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(ArchiveHabitCommand)
export class ArchiveHabitNestjsHandler implements ICommandHandler<ArchiveHabitCommand> {
  private readonly core: ArchiveHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new ArchiveHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: ArchiveHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
