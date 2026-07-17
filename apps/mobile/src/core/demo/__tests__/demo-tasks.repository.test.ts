import { demoTasksRepository } from '../demo-tasks.repository';

async function findTask(id: string) {
  const { data } = await demoTasksRepository.list();
  const task = data.find((t) => t.id === id);
  if (!task) throw new Error(`test fixture task not found: ${id}`);
  return task;
}

/**
 * Regression test mirroring demo-habits.repository.test.ts (2026-07-15,
 * Fase 2 of the Task/Priority consolidation): TaskForm's edit save() fires
 * `edit()`/`changePriority()` and then `relinkGoal()`/`relinkCommitment()`
 * sequentially, never via Promise.all, for the same lost-update reason
 * documented there. Also covers the Task-specific mutual-exclusivity
 * invariant (Goal and Commitment links clear each other) at the demo-mode
 * repository level, mirroring the domain-level Task.spec.ts coverage.
 */
describe('demoTasksRepository — concurrent-write hazard and relation invariant', () => {
  it('sequential edit() then relinkGoal() preserves both changes', async () => {
    const before = await findTask('t-050');
    expect(before.goalId ?? null).toBeNull();

    await demoTasksRepository.edit('t-050', { title: 'Reply to unanswered emails NOW' });
    await demoTasksRepository.relinkGoal('t-050', 'g-01');

    const after = await findTask('t-050');
    expect(after.title).toBe('Reply to unanswered emails NOW');
    expect(after.goalId).toBe('g-01');
  });

  it('relinkGoal(null) removes an existing goal link', async () => {
    await demoTasksRepository.relinkGoal('t-050', 'g-01');
    await demoTasksRepository.relinkGoal('t-050', null);
    const after = await findTask('t-050');
    expect(after.goalId).toBeNull();
  });

  it('relinkGoal clears an existing commitmentId (mutual exclusivity)', async () => {
    await demoTasksRepository.relinkCommitment('t-050', 'c-01');
    await demoTasksRepository.relinkGoal('t-050', 'g-01');
    const after = await findTask('t-050');
    expect(after.goalId).toBe('g-01');
    expect(after.commitmentId).toBeNull();
  });

  it('relinkCommitment clears an existing goalId (mutual exclusivity)', async () => {
    await demoTasksRepository.relinkGoal('t-050', 'g-01');
    await demoTasksRepository.relinkCommitment('t-050', 'c-01');
    const after = await findTask('t-050');
    expect(after.commitmentId).toBe('c-01');
    expect(after.goalId).toBeNull();
  });
});

/**
 * Regression test for a real bug found live (2026-07-15, VS-032 Fase 2
 * functional audit): every mutating method used to mutate `demoTasks` (or a
 * task object within it) in place, so `list()` kept returning the exact
 * same array reference before and after a mutation. React Query's
 * `refetch()` and React's `useMemo` both key change-detection on referential
 * equality — with the same reference every time, a screen showing the
 * currently-active bucket never re-rendered after creating/editing/
 * completing a task, even though the data had genuinely changed (it only
 * "caught up" if some unrelated state change, like switching tabs, forced
 * an unrelated re-render). Fixed by having every mutation build a new array
 * via `replaceDemoTasks()` instead of mutating in place — this test guards
 * that contract directly so a future "just push to demoTasks" edit can't
 * silently reintroduce it.
 */
describe('demoTasksRepository — referential integrity of the returned list', () => {
  it('create() returns a new array reference, not a mutated old one', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.create({ title: 'referential integrity check — create' });
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    expect(after.length).toBe(before.length + 1);
  });

  it('edit() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.edit('t-050', { title: 'referential integrity check — edit' });
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
  });

  it('complete() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.complete('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
  });

  it('relinkGoal() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.relinkGoal('t-050', 'g-01');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
  });

  it('archive() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.archive('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
  });

  it('duplicate() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.duplicate('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
  });

  it('changePriority() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.changePriority('t-050', 'high');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
  });

  it('relinkCommitment() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.relinkCommitment('t-050', 'c-01');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
  });
});
