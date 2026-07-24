import { AIContext } from '../ai-proposal/ai-context.js';
import { AIMemory } from '../ai-proposal/ai-memory.js';

/**
 * AR-050 D-050.1, Incremento 6 — the only place a base context and `AIMemory` ever meet. Fixes
 * that Memory enriches context, it never replaces it: the base context's own fields always take
 * precedence over anything recalled, and a caller who has no `AIMemory` at all (or an empty one)
 * gets the exact same context back, unmodified. Neither `AIPlatform` nor `consumeAIPlatform` nor
 * any adapter needs to know this function exists — a consumer may call it before
 * `consumeAIPlatform`, or skip it entirely.
 */
export async function enrichContextWithMemory<
  TContext extends AIContext,
  TMemory extends object,
>(
  context: TContext,
  memory: AIMemory<TMemory>,
  key: string,
): Promise<TContext> {
  const recalled = await memory.recall(key);
  return recalled ? { ...recalled, ...context } : context;
}
