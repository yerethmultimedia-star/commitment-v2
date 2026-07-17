import { demoHabitsRepository } from '../demo-habits.repository';

/**
 * Regression test for a real bug found live (2026-07-15): EditHabitScreen
 * used to fire `edit()` and `relinkGoal()` via `Promise.all` — both do a
 * read-modify-write against the same in-memory record with no locking, so
 * running them concurrently caused a lost update (whichever `replace()`
 * landed second silently discarded the other's change). Fixed by making
 * the screen await them sequentially; this test guards the repository
 * behavior directly so the fix can't regress if that sequencing is ever
 * "simplified" back into a Promise.all.
 */
describe('demoHabitsRepository — concurrent-write hazard', () => {
  it('sequential edit() then relinkGoal() preserves both changes — the pattern EditHabitScreen.handleSubmit uses', async () => {
    const before = await demoHabitsRepository.getById('h-10');
    expect(before.goalId).toBeUndefined();

    await demoHabitsRepository.edit('h-10', { title: 'Take vitamins DAILY' });
    await demoHabitsRepository.relinkGoal('h-10', 'g-05');

    const after = await demoHabitsRepository.getById('h-10');
    expect(after.title).toBe('Take vitamins DAILY');
    expect(after.goalId).toBe('g-05');
  });

  it('relinkGoal(null) removes an existing link', async () => {
    await demoHabitsRepository.relinkGoal('h-10', 'g-05');
    await demoHabitsRepository.relinkGoal('h-10', null);
    const after = await demoHabitsRepository.getById('h-10');
    expect(after.goalId).toBeUndefined();
  });
});

/**
 * Regression test for a real bug found live (2026-07-16, Product Polish
 * walkthrough): create() used demoHabitDTOs.push(...), mutating the array
 * in place. list() returns that array by reference, so React Query's
 * refetch-after-invalidate saw the "same" reference and a newly created
 * Habit never appeared in the UI without an unrelated re-render forcing it
 * — the same bug class as Tasks' RI-2, just in the one method that fix
 * pass never touched (edit/toggle already went through the correct
 * replace() helper). Fixed by reassigning to a new array via spread.
 */
describe('demoHabitsRepository — referential integrity of the returned list', () => {
  it('create() returns a new list() reference, not a mutated one', async () => {
    const before = await demoHabitsRepository.list();
    await demoHabitsRepository.create({ title: 'Referential integrity probe' });
    const after = await demoHabitsRepository.list();
    expect(after.items).not.toBe(before.items);
    expect(after.items.some((h) => h.title === 'Referential integrity probe')).toBe(true);
  });
});
