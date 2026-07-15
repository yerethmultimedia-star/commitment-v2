import {
  HabitId,
  HabitTitle,
  HabitReminderTime,
  HabitNotFoundError,
} from '@commitment/domain';
import { EditHabitCommand } from './edit-habit.command';
import { buildHabitRecurrence } from './habit-recurrence.util';
import type { HabitVersionedRepository } from '../ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class EditHabitCommandHandlerCore {
  constructor(
    private readonly habitRepository: HabitVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: EditHabitCommand): Promise<void> {
    const id = new HabitId(command.id);
    const habit = await this.habitRepository.findById(id);
    if (!habit) throw new HabitNotFoundError(`Habit not found: ${command.id}`);

    const title = command.title ? new HabitTitle(command.title) : undefined;
    const recurrence = command.recurrenceType
      ? buildHabitRecurrence(
          command.recurrenceType,
          command.daysOfWeek,
          command.dayOfMonth,
          command.month,
        )
      : undefined;
    const reminderTime =
      command.reminderHour !== undefined && command.reminderMinute !== undefined
        ? HabitReminderTime.of(command.reminderHour, command.reminderMinute)
        : undefined;

    habit.edit(new Date(), title, recurrence, reminderTime);

    await this.habitRepository.save(habit);
    await this.eventDispatcher.dispatch(habit.getUncommittedEvents());
    habit.clearUncommittedEvents();
  }
}
