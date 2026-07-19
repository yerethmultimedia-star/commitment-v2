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

  // ADR-022 Task Lifecycle & Execution Model — replaces the old archive()
  // referential-integrity test (TECH_DEBT.md Item 41). Chained in a
  // coherent order (start -> block -> unblock -> returnToPending -> cancel
  // -> reopen) so unblock() also exercises preBlockStatus restoration, not
  // just referential integrity.
  it('start() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.start('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    expect((await findTask('t-050')).status).toBe('in_progress');
  });

  it('block() sets blockedType=manual and returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.block('t-050', 'waiting on review');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    const task = await findTask('t-050');
    expect(task.status).toBe('blocked');
    expect(task.blockedType).toBe('manual');
    expect(task.blockedReason).toBe('waiting on review');
  });

  it('unblock() restores the exact prior status (in_progress) and clears blockedType', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.unblock('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    const task = await findTask('t-050');
    expect(task.status).toBe('in_progress');
    expect(task.blockedType ?? null).toBeNull();
  });

  it('returnToPending() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.returnToPending('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    expect((await findTask('t-050')).status).toBe('pending');
  });

  it('cancel() returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.cancel('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    expect((await findTask('t-050')).status).toBe('cancelled');
  });

  it('reopen() returns a new array reference and lands on pending', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.reopen('t-050');
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    expect((await findTask('t-050')).status).toBe('pending');
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

  // Task Capability Completion Story 3 — mirrors the real backend's
  // ScheduleTaskCommand at the demo-mode repository level.
  it('schedule() updates dueDate and returns a new array reference', async () => {
    const { data: before } = await demoTasksRepository.list();
    await demoTasksRepository.schedule('t-050', '2026-09-15T00:00:00.000Z', null);
    const { data: after } = await demoTasksRepository.list();
    expect(after).not.toBe(before);
    expect((await findTask('t-050')).dueDate).toBe('2026-09-15T00:00:00.000Z');
  });

  it('schedule(null) explicitly clears dueDate rather than leaving it unchanged', async () => {
    await demoTasksRepository.schedule('t-050', '2026-09-15T00:00:00.000Z', null);
    await demoTasksRepository.schedule('t-050', null, null);
    const after = await findTask('t-050');
    expect(after.dueDate ?? null).toBeNull();
  });

  // Task Capability Completion Story 6 — regression guard for a real bug:
  // the real backend resolves an omitted startDate to null, so every
  // schedule() call must explicitly pass the current startDate to avoid
  // silently clearing it on an unrelated dueDate change.
  it('schedule() sets startDate when passed, and preserves it across a later dueDate-only change', async () => {
    await demoTasksRepository.schedule('t-050', '2026-09-15T00:00:00.000Z', '2026-09-10T00:00:00.000Z');
    expect((await findTask('t-050')).startDate).toBe('2026-09-10T00:00:00.000Z');

    // Caller passes the task's current startDate through unchanged, as
    // TaskForm.tsx now does — must NOT clear it.
    await demoTasksRepository.schedule('t-050', '2026-09-20T00:00:00.000Z', '2026-09-10T00:00:00.000Z');
    const after = await findTask('t-050');
    expect(after.dueDate).toBe('2026-09-20T00:00:00.000Z');
    expect(after.startDate).toBe('2026-09-10T00:00:00.000Z');
  });

  it('create() accepts tags/metadata and edit() updates them', async () => {
    const { taskId } = await demoTasksRepository.create({
      title: 'Story 6 tags/metadata test',
      tags: ['urgent', 'work'],
      metadata: { source: 'test' },
    });
    const created = await findTask(taskId);
    expect(created.tags).toEqual(['urgent', 'work']);
    expect(created.metadata).toEqual({ source: 'test' });

    await demoTasksRepository.edit(taskId, { tags: ['updated'] });
    const edited = await findTask(taskId);
    expect(edited.tags).toEqual(['updated']);
    expect(edited.metadata).toEqual({ source: 'test' }); // untouched
  });

  it('create() defaults tags/metadata/startDate when omitted', async () => {
    const { taskId } = await demoTasksRepository.create({ title: 'No tags/metadata given' });
    const created = await findTask(taskId);
    expect(created.tags).toEqual([]);
    expect(created.metadata).toEqual({});
    expect(created.startDate ?? null).toBeNull();
  });
});
