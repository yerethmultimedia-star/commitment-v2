import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostponeHabitCommand } from '../application/commands/postpone-habit.command';
import { PostponeHabitCommandHandlerCore } from '../application/commands/postpone-habit.handler';
import type { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(PostponeHabitCommand)
export class PostponeHabitNestjsHandler implements ICommandHandler<PostponeHabitCommand> {
  private readonly core: PostponeHabitCommandHandlerCore;

  constructor(
    @Inject('HabitRepository') habitRepository: HabitVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new PostponeHabitCommandHandlerCore(
      habitRepository,
      eventDispatcher,
    );
  }

  async execute(command: PostponeHabitCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
