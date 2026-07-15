import { HabitId, HabitNotFoundError } from '@commitment/domain';
import { DisableHabitCommand } from './disable-habit.command';
import type { HabitVersionedRepository } from '../ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class DisableHabitCommandHandlerCore {
  constructor(
    private readonly habitRepository: HabitVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: DisableHabitCommand): Promise<void> {
    const id = new HabitId(command.id);
    const habit = await this.habitRepository.findById(id);
    if (!habit) throw new HabitNotFoundError(`Habit not found: ${command.id}`);

    habit.disable();

    await this.habitRepository.save(habit);
    await this.eventDispatcher.dispatch(habit.getUncommittedEvents());
    habit.clearUncommittedEvents();
  }
}
