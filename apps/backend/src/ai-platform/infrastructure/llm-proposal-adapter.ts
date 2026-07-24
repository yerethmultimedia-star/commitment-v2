import { Injectable, Logger } from '@nestjs/common';
import { AIContext, AIPlatform, AIProposal } from '@commitment/domain';

export interface LLMProposalAdapterConfig {
  readonly apiUrl: string;
  readonly apiKey: string;
  readonly model: string;
}

type FetchLike = typeof fetch;

function isValidProposal(value: unknown): value is AIProposal {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.type === 'string' &&
    typeof candidate.targetId === 'string' &&
    typeof candidate.rationale === 'string' &&
    typeof candidate.metadata === 'object' &&
    candidate.metadata !== null
  );
}

/**
 * AR-050 D-050.1, Incremento 5 — the only file in the codebase allowed to know about a concrete
 * LLM provider: its HTTP endpoint, authentication, model identifier, and wire format. `AIPlatform`
 * never sees any of that — this class is just one more implementation of it, returning
 * `AIProposal[]` like every other. Deliberately narrow: one provider, one model, no dynamic
 * provider selection, no failover, no caching — those are future evolutions, not this increment.
 * `fetchImpl` is injectable precisely so tests never need a real network call or a real API key.
 */
@Injectable()
export class LLMProposalAdapter implements AIPlatform<AIContext> {
  private readonly logger = new Logger(LLMProposalAdapter.name);

  constructor(
    private readonly config: LLMProposalAdapterConfig,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  public async propose(context: AIContext): Promise<readonly AIProposal[]> {
    const response = await this.fetchImpl(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({ model: this.config.model, context }),
    });

    if (!response.ok) {
      this.logger.warn(
        `LLM provider request failed with status ${response.status}`,
      );
      throw new Error(
        `LLM provider request failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as { proposals?: unknown };
    if (!Array.isArray(payload.proposals)) {
      return [];
    }

    // Defensive parsing: a provider returning a malformed proposal never leaks past this
    // boundary — the platform's contract only ever sees genuinely valid `AIProposal` values.
    return payload.proposals.filter(isValidProposal);
  }
}
