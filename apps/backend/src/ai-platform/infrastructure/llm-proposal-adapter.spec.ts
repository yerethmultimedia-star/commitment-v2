import { LLMProposalAdapter } from './llm-proposal-adapter';

function fakeResponse(status: number, body: unknown): Promise<Response> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe('AR-050 D-050.1, Incremento 5 — LLMProposalAdapter', () => {
  const config = {
    apiUrl: 'https://example-provider.test/v1/proposals',
    apiKey: 'test-key',
    model: 'test-model',
  };

  it('sends the context to the configured provider with the configured auth header and model', async () => {
    const calls: [string, RequestInit][] = [];
    const fetchImpl = (url: string, init: RequestInit) => {
      calls.push([url, init]);
      return fakeResponse(200, { proposals: [] });
    };

    const adapter = new LLMProposalAdapter(config, fetchImpl);
    await adapter.propose({ userId: 'u1' });

    expect(calls).toHaveLength(1);
    const [url, init] = calls[0] ?? [];
    expect(url).toBe(config.apiUrl);
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${config.apiKey}`,
    });
    const body = JSON.parse(init?.body as string) as {
      model: string;
      context: unknown;
    };
    expect(body.model).toBe(config.model);
    expect(body.context).toEqual({ userId: 'u1' });
  });

  it('parses a well-formed provider response into AIProposal[]', async () => {
    const fetchImpl = () =>
      fakeResponse(200, {
        proposals: [
          {
            type: 'SUGGEST_HABIT',
            targetId: 'habit-1',
            rationale: 'derived from context',
            metadata: { confidence: 0.9 },
          },
        ],
      });

    const adapter = new LLMProposalAdapter(config, fetchImpl);
    const proposals = await adapter.propose({});

    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.type).toBe('SUGGEST_HABIT');
  });

  it('drops malformed entries instead of leaking them past the platform boundary', async () => {
    const fetchImpl = () =>
      fakeResponse(200, {
        proposals: [
          {
            type: 'SUGGEST_HABIT',
            targetId: 'ok',
            rationale: 'r',
            metadata: {},
          },
          { notAProposal: true },
          'a-bare-string',
        ],
      });

    const adapter = new LLMProposalAdapter(config, fetchImpl);
    const proposals = await adapter.propose({});

    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.targetId).toBe('ok');
  });

  it('returns an empty list when the provider omits proposals entirely', async () => {
    const fetchImpl = () => fakeResponse(200, {});
    const adapter = new LLMProposalAdapter(config, fetchImpl);

    await expect(adapter.propose({})).resolves.toEqual([]);
  });

  it('throws on a non-2xx provider response — the platform never silently swallows a provider failure', async () => {
    const fetchImpl = () => fakeResponse(500, {});
    const adapter = new LLMProposalAdapter(config, fetchImpl);

    await expect(adapter.propose({})).rejects.toThrow(
      'LLM provider request failed with status 500',
    );
  });
});
