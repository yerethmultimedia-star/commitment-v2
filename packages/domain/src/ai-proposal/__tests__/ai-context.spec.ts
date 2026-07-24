import { AIContext } from '../ai-context.js';
import { AIPlatform } from '../ai-platform.js';
import { AIProposal } from '../ai-proposal.js';

describe('AR-050 D-050.1, Incremento 3 — AIContext concept', () => {
  it('is a structured domain concept: any concrete object context satisfies it, no bare primitives allowed', () => {
    interface HabitCoachingContext extends AIContext {
      readonly habitDescriptions: readonly string[];
    }

    const context: HabitCoachingContext = { habitDescriptions: ['read daily'] };
    const asContext: AIContext = context;

    expect(asContext).toBe(context);
    // @ts-expect-error — a bare primitive is not a structured domain concept.
    const invalid: AIContext = 'not-a-context';
    void invalid;
  });

  it('the platform still knows nothing about consumers or providers, and a fresh context type plugs in without redefining AIPlatform', async () => {
    interface JournalReflectionContext extends AIContext {
      readonly recentEntries: readonly string[];
    }

    class ReflectionAdapter implements AIPlatform<JournalReflectionContext> {
      public async propose(
        context: JournalReflectionContext,
      ): Promise<readonly AIProposal[]> {
        return context.recentEntries.map((entry) => ({
          type: 'COACH_TIP',
          targetId: entry,
          rationale: 'derived from a recent journal entry',
          metadata: {},
        }));
      }
    }

    const adapter: AIPlatform<JournalReflectionContext> = new ReflectionAdapter();
    const proposals = await adapter.propose({ recentEntries: ['felt productive'] });

    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.targetId).toBe('felt productive');
  });
});
