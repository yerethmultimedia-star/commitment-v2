import { InMemoryAIMemory } from '../../ai-proposal/in-memory-ai-memory.js';
import { enrichContextWithMemory } from '../enrich-context-with-memory.js';

interface BaseContext {
  readonly userId: string;
  readonly streakDays: number;
}

interface RecalledMemory {
  readonly favoriteHabitCategory: string;
  readonly streakDays: number;
}

describe('AR-050 D-050.1, Incremento 6 — enrichContextWithMemory', () => {
  const baseContext: BaseContext = { userId: 'user-1', streakDays: 5 };

  it('returns the exact same context, unmodified, when memory has nothing for that key', async () => {
    const memory = new InMemoryAIMemory<RecalledMemory>();

    const enriched = await enrichContextWithMemory(baseContext, memory, 'user-1');

    expect(enriched).toEqual(baseContext);
  });

  it('adds new fields from memory without touching what the base context already provides', async () => {
    const memory = new InMemoryAIMemory<RecalledMemory>();
    memory.remember('user-1', { favoriteHabitCategory: 'fitness', streakDays: 999 });

    const enriched = (await enrichContextWithMemory(
      baseContext,
      memory,
      'user-1',
    )) as BaseContext & RecalledMemory;

    expect(enriched.favoriteHabitCategory).toBe('fitness');
    // The base context's own field wins over anything memory tried to contribute for the same key —
    // Memory enriches, it never overrides the system's original source of truth.
    expect(enriched.streakDays).toBe(5);
  });
});
