import {
  Habit,
  HabitId,
  HabitTitle,
  HabitReminderTime,
  IdentityId,
} from '@commitment/domain';
import { RegisterHabitCommand } from './register-habit.command';
import { RegisterHabitResult } from './register-habit.result';
import { buildHabitRecurrence } from './habit-recurrence.util';
import type { HabitVersionedRepository } from '../ports/habit-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class RegisterHabitCommandHandlerCore {
  constructor(
    private readonly habitRepository: HabitVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: RegisterHabitCommand,
  ): Promise<RegisterHabitResult> {
    const id = new HabitId(command.id);
    const existing = await this.habitRepository.findById(id);
    if (existing) {
      const version = await this.habitRepository.save(existing);
      return new RegisterHabitResult(existing.id.value, version);
    }

    const identityId = new IdentityId(command.identityId);
    const title = new HabitTitle(command.title);
    const recurrence = buildHabitRecurrence(
      command.recurrenceType,
      command.daysOfWeek,
      command.dayOfMonth,
      command.month,
    );
    const reminderTime = HabitReminderTime.of(
      command.reminderHour,
      command.reminderMinute,
    );

    const habit = Habit.register(
      id,
      identityId,
      title,
      recurrence,
      reminderTime,
      command.goalId ?? null,
      new Date(),
    );

    const version = await this.habitRepository.save(habit);

    const events = habit.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    habit.clearUncommittedEvents();

    return new RegisterHabitResult(habit.id.value, version);
  }
}
