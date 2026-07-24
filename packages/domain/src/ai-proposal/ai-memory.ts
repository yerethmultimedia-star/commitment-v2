/**
 * AR-050 D-050.1, Incremento 6 — Memory is a source of additional context, never a new center of
 * the domain. It belongs to the AI platform's own vocabulary (context enrichment): it never
 * executes domain logic, never becomes the owner of `Identity` or any other domain aggregate, and
 * never replaces the system's original sources of truth. `recall` is deliberately the only
 * operation — a query, mirroring `AIPlatform.propose()`'s own read-only shape. Deliberately out of
 * scope for this increment: semantic retrieval, embeddings, vector indices, compression, ranking,
 * distributed sync — none of those are needed to validate D-050.1.
 */
export interface AIMemory<TMemory extends object = object> {
  recall(key: string): Promise<TMemory | null>;
}
