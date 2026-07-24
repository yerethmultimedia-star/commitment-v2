import { AIProposal } from './ai-proposal.js';

/**
 * AR-047 D-047.1 — the single integration point any AI capability (present or future — AR-050's
 * first real consumer included) must implement to interact with the application. `TContext` is
 * intentionally generic: this contract fixes the boundary (propose, never enact), not what a
 * proposal is about — that belongs to whichever capability implements it, not to this layer.
 * The return type is the enforcement: it can only ever be `AIProposal[]`, never a Command, never
 * a repository, never anything capable of mutating domain state directly.
 */
export interface AIProposalSource<TContext = unknown> {
  propose(context: TContext): Promise<readonly AIProposal[]>;
}
