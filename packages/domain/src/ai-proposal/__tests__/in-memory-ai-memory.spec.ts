import { InMemoryAIMemory } from '../in-memory-ai-memory.js';

describe('AR-050 D-050.1, Incremento 6 — InMemoryAIMemory', () => {
  it('recalls null for a key that was never remembered', async () => {
    const memory = new InMemoryAIMemory<{ note: string }>();
    await expect(memory.recall('unknown')).resolves.toBeNull();
  });

  it('recalls exactly what was remembered for a key', async () => {
    const memory = new InMemoryAIMemory<{ note: string }>();
    memory.remember('user-1', { note: 'prefers morning habits' });

    await expect(memory.recall('user-1')).resolves.toEqual({
      note: 'prefers morning habits',
    });
  });
});
