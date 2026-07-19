export class UnblockTaskCommand {
  constructor(
    public readonly id: string,
    /**
     * The public REST endpoint always constructs this as 'manual' — 'system'
     * is only ever used by the internal dependency-resolution cascade
     * (ADR-022 §4.2/§5), never by a direct client request.
     */
    public readonly source: 'manual' | 'system',
  ) {}
}
