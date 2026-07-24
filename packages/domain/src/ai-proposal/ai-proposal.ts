/**
 * AR-047 D-047.1 — the only shape any AI capability may produce. Deliberately data-only, no
 * method of any kind: an executable action can never be smuggled through this contract, because
 * there is nothing here to invoke. `type`/`targetId` are opaque to this layer on purpose — they
 * describe what the proposal is about, never what to execute.
 */
export interface AIProposal {
  readonly type: string;
  readonly targetId: string;
  readonly rationale: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}
