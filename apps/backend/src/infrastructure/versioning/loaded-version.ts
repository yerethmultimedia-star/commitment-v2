import type { AggregateRoot } from '@commitment/domain';

/**
 * The version this aggregate instance was loaded at, before any of its
 * currently-uncommitted mutations were applied.
 *
 * `AggregateRoot.version` already reflects every uncommitted event (it's
 * incremented inside `recordEvent()`, before the save), so the version at
 * load time is recoverable without a separate field: it's the current
 * version minus the number of events not yet persisted. This is the same
 * arithmetic ADR-021's Goal handler already uses to compute `EventStore`'s
 * `expectedVersion` — extracted here as the single place that knows it,
 * per AR-028 (docs/ARCHITECTURE_REMEDIATION/AR-028/ANALISIS.md), so repositories
 * never re-derive it independently.
 */
export function getLoadedVersion(aggregate: AggregateRoot<unknown>): number {
  return aggregate.version - aggregate.getUncommittedEvents().length;
}
