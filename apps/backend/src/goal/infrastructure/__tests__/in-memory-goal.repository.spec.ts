import { InMemoryGoalRepository } from '../in-memory-goal.repository';
import {
  Goal,
  GoalId,
  GoalTitle,
  GoalDescription,
  IdentityId,
} from '@commitment/domain';
import { OptimisticConcurrencyError } from '../../../infrastructure/errors/optimistic-concurrency.error';

const ID = '018f6b5c-42e1-7000-8000-999999999999';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';

function makeGoal(id = ID): Goal {
  return Goal.register(
    new GoalId(id),
    new IdentityId(IDENTITY_ID),
    new GoalTitle('Test Goal'),
    new GoalDescription('Test description'),
  );
}

describe('InMemoryGoalRepository — AR-028 optimistic concurrency', () => {
  it('persists exactly aggregate.version at every step — never recomputed via addition', async () => {
    const repository = new InMemoryGoalRepository();
    const goal = makeGoal();

    const v1 = await repository.save(goal);
    expect(v1).toBe(goal.version);
    goal.clearUncommittedEvents();

    goal.rename(new GoalTitle('Renamed Goal'));
    const v2 = await repository.save(goal);
    expect(v2).toBe(goal.version);
  });

  it('throws OptimisticConcurrencyError when a stale copy is saved after a concurrent write', async () => {
    const repository = new InMemoryGoalRepository();
    const id = new GoalId(ID);

    const sessionA = makeGoal();
    await repository.save(sessionA);
    const registeredEvent = sessionA.getUncommittedEvents()[0];
    sessionA.clearUncommittedEvents();

    const sessionB = Goal.register(
      id,
      new IdentityId(IDENTITY_ID),
      new GoalTitle('Throwaway'),
      null,
    );
    sessionB.loadFromHistory([registeredEvent]);
    sessionB.clearUncommittedEvents();

    sessionA.rename(new GoalTitle('A wins'));
    await repository.save(sessionA);

    sessionB.rename(new GoalTitle('B is stale'));
    await expect(repository.save(sessionB)).rejects.toThrow(
      OptimisticConcurrencyError,
    );
  });
});
