import { AIProposalSource } from './ai-proposal-source.js';

/**
 * AR-050 D-050.1, Incremento 2 — the AI platform's own contract, named to match D-050.1's
 * vocabulary ("la plataforma de IA... transforma contexto del dominio en propuestas
 * estructuradas"). Deliberately not a new interface: AR-047's `AIProposalSource` already
 * satisfies every property D-050.1 requires of the platform (context in, `AIProposal[]` out,
 * zero provider knowledge) — this is an explicit alias, so the platform has a name a reader can
 * search for, without duplicating a contract AR-047 already froze. `TContext` stays generic here
 * for the same reason it stays generic in `AIProposalSource`: this increment fixes the platform's
 * boundary, not what its context contains — that's Incremento 3.
 */
export type AIPlatform<TContext = unknown> = AIProposalSource<TContext>;
