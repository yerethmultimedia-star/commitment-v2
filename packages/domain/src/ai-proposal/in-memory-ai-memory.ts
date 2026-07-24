import { AIMemory } from './ai-memory.js';

/**
 * AR-050 D-050.1, Incremento 6 — the minimal concrete `AIMemory`, proving the port is genuinely
 * satisfiable without inventing persistence, embeddings, or any retrieval strategy. `remember` is
 * deliberately not part of the `AIMemory` port itself (the port stays read-only, matching
 * `AIPlatform`) — it exists only so this in-memory implementation can be seeded in tests.
 */
export class InMemoryAIMemory<TMemory extends object = object>
  implements AIMemory<TMemory>
{
  private readonly store = new Map<string, TMemory>();

  public remember(key: string, value: TMemory): void {
    this.store.set(key, value);
  }

  public async recall(key: string): Promise<TMemory | null> {
    await Promise.resolve();
    return this.store.get(key) ?? null;
  }
}
