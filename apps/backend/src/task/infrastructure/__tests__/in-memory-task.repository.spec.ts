import { InMemoryTaskRepository } from '../in-memory-task.repository';
import {
  Task,
  TaskId,
  TaskTitle,
  TaskDescription,
  TaskPriority,
  IdentityId,
} from '@commitment/domain';
import { OptimisticConcurrencyError } from '../../../infrastructure/errors/optimistic-concurrency.error';

const ID = '018f6b5c-42e1-7000-8000-999999999999';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';

function makeTask(id = ID): Task {
  return Task.register(
    new TaskId(id),
    new IdentityId(IDENTITY_ID),
    new TaskTitle('Test Task'),
    new TaskDescription('Test description'),
    TaskPriority.medium(),
  );
}

describe('InMemoryTaskRepository — AR-028 optimistic concurrency', () => {
  it('persists exactly aggregate.version at every step — never recomputed via addition', async () => {
    const repository = new InMemoryTaskRepository();
    const task = makeTask();

    const v1 = await repository.save(task);
    expect(v1).toBe(task.version);
    task.clearUncommittedEvents();

    task.changePriority(TaskPriority.high());
    const v2 = await repository.save(task);
    expect(v2).toBe(task.version);
  });

  it('throws OptimisticConcurrencyError when a stale copy is saved after a concurrent write', async () => {
    const repository = new InMemoryTaskRepository();
    const id = new TaskId(ID);

    const sessionA = makeTask();
    await repository.save(sessionA);
    const registeredEvent = sessionA.getUncommittedEvents()[0];
    sessionA.clearUncommittedEvents();

    const sessionB = Task.register(
      id,
      new IdentityId(IDENTITY_ID),
      new TaskTitle('Throwaway'),
      null,
      TaskPriority.medium(),
    );
    sessionB.loadFromHistory([registeredEvent]);
    sessionB.clearUncommittedEvents();

    sessionA.changePriority(TaskPriority.high());
    await repository.save(sessionA);

    sessionB.changePriority(TaskPriority.low());
    await expect(repository.save(sessionB)).rejects.toThrow(
      OptimisticConcurrencyError,
    );
  });
});
