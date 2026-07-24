import { AIProposal } from '../ai-proposal.js';
import { AIProposalSource } from '../ai-proposal-source.js';

describe('AR-047 D-047.1 — AI proposal boundary', () => {
  it('AIProposal is data-only: nothing on it is callable', () => {
    const proposal: AIProposal = {
      type: 'SUGGEST_HABIT',
      targetId: 'habit-123',
      rationale: 'evidence-backed suggestion, not an executable action',
      metadata: { confidence: 0.8 },
    };

    for (const value of Object.values(proposal)) {
      expect(typeof value).not.toBe('function');
    }
  });

  it('AIProposalSource.propose can only ever return AIProposal[] — never a Command or repository', async () => {
    class FakeAISource implements AIProposalSource<{ userId: string }> {
      public async propose(
        context: { userId: string },
      ): Promise<readonly AIProposal[]> {
        return [
          {
            type: 'SUGGEST_HABIT',
            targetId: context.userId,
            rationale: 'test double',
            metadata: {},
          },
        ];
      }
    }

    const source = new FakeAISource();
    const proposals = await source.propose({ userId: 'u1' });

    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.type).toBe('SUGGEST_HABIT');
    // Structural guarantee, not a runtime check: TypeScript's own type system rejects any
    // implementation of `propose` that returns something other than `AIProposal[]` at compile
    // time — there is no method here to "execute" a proposal, only to read its data.
  });

  it('packages/domain cannot resolve @nestjs/cqrs — the CommandBus is not reachable from this layer, by construction, not convention', async () => {
    // TypeScript already refuses to compile a static `import('@nestjs/cqrs')` here (no such
    // dependency declared in package.json) — even stronger than this runtime check. The
    // indirection through a variable is only to let this file compile at all while still
    // proving the same fact at runtime: the module genuinely cannot be resolved.
    const undeclaredDependency = '@nestjs/cqrs';
    await expect(import(undeclaredDependency)).rejects.toThrow();
  });
});
