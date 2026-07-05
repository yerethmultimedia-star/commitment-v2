import { AggregateRoot } from '../aggregate-root.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { UniqueEntityId } from '../unique-entity-id.js';

/** Simple dummy aggregate for testing the shared AggregateRoot contract */
class DummyAggregate extends AggregateRoot {
  constructor() {
    super(new UniqueEntityId('00000000-0000-0000-0000-000000000001'));
  }
  public record(event: DomainEvent): void { this.recordEvent(event); }

  // expose id for convenience
  public setId(id: UniqueEntityId): void {
      (this as unknown as { _id: UniqueEntityId })._id = id;
  }

  public get id(): UniqueEntityId {
      return (this as unknown as { _id: UniqueEntityId })._id;
  }

  public get version(): number {
      return (this as unknown as { _version: number })._version;
  }

  protected applyEvent(_event: DomainEvent): void {
    // No state mutation needed for version contract tests
  }
}

/** Helper to create a minimal DomainEvent with given version */
function makeEvent(aggregateId: string, version: number, name: string = 'dummy.event'): DomainEvent {
  return {
    name,
    metadata: {
      eventId: `evt-${version}`,
      aggregateId,
      aggregateVersion: version,
      eventVersion: 1,
      occurredAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      actorType: 'SYSTEM',
      actorId: 'system',
      correlationId: `corr-${version}`,
      causationId: `cmd-${version}`,
      tenantId: null,
    },
    payload: {},
  };
}

describe('Shared AggregateRoot contract', () => {
  it('starts with version 0 for a new aggregate', () => {
    const agg = new DummyAggregate();
    expect(agg.version).toBe(0);
    expect(agg.getUncommittedEvents()).toHaveLength(0);
  });

  it('increments version exactly once per recorded event', () => {
    const agg = new DummyAggregate();
    agg.setId(new UniqueEntityId('00000000-0000-0000-0000-000000000001'));
    const e1 = makeEvent('00000000-0000-0000-0000-000000000001', 1);
    agg.record(e1);
    expect(agg.version).toBe(1);
    expect(agg.getUncommittedEvents()).toHaveLength(1);
    const e2 = makeEvent('00000000-0000-0000-0000-000000000001', 2);
    agg.record(e2);
    expect(agg.version).toBe(2);
    expect(agg.getUncommittedEvents()).toHaveLength(2);
    // ensure order is preserved
    expect((agg.getUncommittedEvents()[0] as DomainEvent).metadata.aggregateVersion).toBe(1);
    expect((agg.getUncommittedEvents()[1] as DomainEvent).metadata.aggregateVersion).toBe(2);
  });

  it('restores version correctly when loading from history', () => {
    const agg = new DummyAggregate();
    const history = [
      makeEvent('00000000-0000-0000-0000-000000000002', 1),
      makeEvent('00000000-0000-0000-0000-000000000002', 2),
      makeEvent('00000000-0000-0000-0000-000000000002', 3),
    ];
    agg.loadFromHistory(history);
    expect(agg.version).toBe(3);
    // no new uncommitted events after loading history
    expect(agg.getUncommittedEvents()).toHaveLength(0);
  });
});
