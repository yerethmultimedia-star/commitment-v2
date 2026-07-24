import { AIContext } from './ai-context.js';
import { AIProposalSource } from './ai-proposal-source.js';

/**
 * AR-050 D-050.1, Incremento 2 — the AI platform's own contract, named to match D-050.1's
 * vocabulary ("la plataforma de IA... transforma contexto del dominio en propuestas
 * estructuradas"). Deliberately not a new interface: AR-047's `AIProposalSource` already
 * satisfies every property D-050.1 requires of the platform (context in, `AIProposal[]` out,
 * zero provider knowledge) — this is an explicit alias, so the platform has a name a reader can
 * search for, without duplicating a contract AR-047 already froze.
 *
 * `TContext extends AIContext` (Incremento 3) is the only constraint this alias adds on top of
 * `AIProposalSource` — it fixes that a platform's context is always a structured domain concept,
 * never a bare primitive, without fixing what that context contains, how it's obtained, or how
 * it's cached. `AIProposalSource` itself stays untouched, exactly as AR-047 froze it — this
 * constraint lives only on the vocabulary AR-050 owns.
 */
export type AIPlatform<TContext extends AIContext = AIContext> =
  AIProposalSource<TContext>;
