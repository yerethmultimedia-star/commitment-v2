import { InMemoryOperationQueue } from '../operation-queue';

describe('InMemoryOperationQueue', () => {
  it('starts empty', async () => {
    const queue = new InMemoryOperationQueue();
    expect(await queue.listPending()).toEqual([]);
  });

  it('enqueues and lists pending operations in insertion order', async () => {
    const queue = new InMemoryOperationQueue<{ type: string }>();
    await queue.enqueue({ id: '1', payload: { type: 'a' } });
    await queue.enqueue({ id: '2', payload: { type: 'b' } });

    expect(await queue.listPending()).toEqual([
      { id: '1', payload: { type: 'a' } },
      { id: '2', payload: { type: 'b' } },
    ]);
  });

  it('dequeues a pending operation by id', async () => {
    const queue = new InMemoryOperationQueue<{ type: string }>();
    await queue.enqueue({ id: '1', payload: { type: 'a' } });
    await queue.enqueue({ id: '2', payload: { type: 'b' } });

    await queue.dequeue('1');

    const pending = await queue.listPending();
    expect(pending).toHaveLength(1);
    expect(pending[0]?.id).toBe('2');
  });

  it('dequeuing an unknown id is a no-op', async () => {
    const queue = new InMemoryOperationQueue();
    await queue.enqueue({ id: '1', payload: undefined });

    await queue.dequeue('missing');

    expect(await queue.listPending()).toHaveLength(1);
  });

  it('listPending returns a snapshot, not a live reference', async () => {
    const queue = new InMemoryOperationQueue<{ type: string }>();
    await queue.enqueue({ id: '1', payload: { type: 'a' } });

    const first = await queue.listPending();
    await queue.enqueue({ id: '2', payload: { type: 'b' } });

    expect(first).toHaveLength(1);
  });
});
