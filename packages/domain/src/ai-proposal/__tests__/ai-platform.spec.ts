import { AIPlatform } from '../ai-platform.js';
import { AIProposal } from '../ai-proposal.js';
import { AIProposalSource } from '../ai-proposal-source.js';

describe('AR-050 D-050.1, Incremento 2 — AIPlatform contract', () => {
  it('AIPlatform<TContext> is structurally identical to AIProposalSource<TContext> — no parallel contract was introduced', () => {
    class ExampleSource implements AIProposalSource<{ userId: string }> {
      public async propose(): Promise<readonly AIProposal[]> {
        return [];
      }
    }

    // If AIPlatform diverged in shape from AIProposalSource, this assignment wouldn't compile.
    const asPlatform: AIPlatform<{ userId: string }> = new ExampleSource();
    expect(asPlatform).toBeInstanceOf(ExampleSource);
  });

  it('a future adapter can implement AIPlatform with a concrete context, without touching the contract', async () => {
    interface FutureConcreteContext {
      readonly goalDescriptions: readonly string[];
    }

    class FutureAdapter implements AIPlatform<FutureConcreteContext> {
      public async propose(
        context: FutureConcreteContext,
      ): Promise<readonly AIProposal[]> {
        return context.goalDescriptions.map((description) => ({
          type: 'SUGGEST_HABIT',
          targetId: description,
          rationale: 'derived from goal description',
          metadata: {},
        }));
      }
    }

    const adapter: AIPlatform<FutureConcreteContext> = new FutureAdapter();
    const proposals = await adapter.propose({ goalDescriptions: ['read more'] });

    expect(proposals).toHaveLength(1);
    // Zero provider-specific concept (no model name, no API key, no prompt) appears anywhere in
    // the adapter's own shape — only the domain-level context and AIProposal.
    expect(Object.keys(await adapter.propose({ goalDescriptions: [] }))).toEqual([]);
  });
});
