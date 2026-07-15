import { HabitId, HabitNotFoundError } from '@commitment/domain';
import { UncompleteHabitCommand } from './uncomplete-habit.command';
import type { HabitVersionedRepository } from '../ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class UncompleteHabitCommandHandlerCore {
  constructor(
    private readonly habitRepository: HabitVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: UncompleteHabitCommand): Promise<void> {
    const id = new HabitId(command.id);
    const habit = await this.habitRepository.findById(id);
    if (!habit) throw new HabitNotFoundError(`Habit not found: ${command.id}`);

    const now = new Date();
    const onDate = command.onDate ? new Date(command.onDate) : now;
    habit.uncomplete(onDate, now);

    await this.habitRepository.save(habit);
    await this.eventDispatcher.dispatch(habit.getUncommittedEvents());
    habit.clearUncommittedEvents();
  }
}
