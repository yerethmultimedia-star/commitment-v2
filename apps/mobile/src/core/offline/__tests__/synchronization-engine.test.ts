import { NoOpSynchronizationEngine } from '../synchronization-engine';
import { InMemoryOfflineStorage } from '../storage';
import { InMemoryOperationQueue } from '../operation-queue';

describe('NoOpSynchronizationEngine', () => {
  it('depends on Storage and OperationQueue without mutating either', async () => {
    const storage = new InMemoryOfflineStorage<string>();
    const queue = new InMemoryOperationQueue<string>();
    await storage.set('k', 'v');
    await queue.enqueue({ id: '1', payload: 'op' });

    const engine = new NoOpSynchronizationEngine(storage, queue);
    await engine.synchronize();

    expect(await storage.get('k')).toBe('v');
    expect(await queue.listPending()).toEqual([{ id: '1', payload: 'op' }]);
  });

  it('resolves even with empty storage and an empty queue', async () => {
    const engine = new NoOpSynchronizationEngine(
      new InMemoryOfflineStorage(),
      new InMemoryOperationQueue(),
    );

    await expect(engine.synchronize()).resolves.toBeUndefined();
  });
});
