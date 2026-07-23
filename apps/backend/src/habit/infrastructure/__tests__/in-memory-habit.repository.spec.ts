import { InMemoryHabitRepository } from '../in-memory-habit.repository';
import {
  Habit,
  HabitId,
  HabitTitle,
  HabitRecurrence,
  HabitReminderTime,
  IdentityId,
} from '@commitment/domain';
import { OptimisticConcurrencyError } from '../../../infrastructure/errors/optimistic-concurrency.error';

const ID = '018f6b5c-42e1-7000-8000-999999999999';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';
const NOW = new Date('2026-07-20T00:00:00.000Z');

function makeHabit(id = ID): Habit {
  return Habit.register(
    new HabitId(id),
    new IdentityId(IDENTITY_ID),
    new HabitTitle('Drink water'),
    HabitRecurrence.daily(),
    HabitReminderTime.of(9, 0),
    null,
    NOW,
  );
}

describe('InMemoryHabitRepository — AR-028 optimistic concurrency', () => {
  it('persists exactly aggregate.version at every step — never recomputed via addition', async () => {
    const repository = new InMemoryHabitRepository();
    const habit = makeHabit();

    const v1 = await repository.save(habit);
    expect(v1).toBe(habit.version);
    habit.clearUncommittedEvents();

    habit.edit(NOW, new HabitTitle('Drink more water'));
    const v2 = await repository.save(habit);
    expect(v2).toBe(habit.version);
  });

  it('throws OptimisticConcurrencyError when a stale copy is saved after a concurrent write', async () => {
    const repository = new InMemoryHabitRepository();
    const id = new HabitId(ID);

    const sessionA = makeHabit();
    await repository.save(sessionA);
    const registeredEvent = sessionA.getUncommittedEvents()[0];
    sessionA.clearUncommittedEvents();

    const sessionB = Habit.register(
      id,
      new IdentityId(IDENTITY_ID),
      new HabitTitle('Throwaway'),
      HabitRecurrence.daily(),
      HabitReminderTime.of(9, 0),
      null,
      NOW,
    );
    sessionB.loadFromHistory([registeredEvent]);
    sessionB.clearUncommittedEvents();

    sessionA.edit(NOW, new HabitTitle('A wins'));
    await repository.save(sessionA);

    sessionB.edit(NOW, new HabitTitle('B is stale'));
    await expect(repository.save(sessionB)).rejects.toThrow(
      OptimisticConcurrencyError,
    );
  });
});
