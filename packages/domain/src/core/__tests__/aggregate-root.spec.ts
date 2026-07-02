import { AggregateRoot } from '../aggregate-root.base.js';
import { DomainEvent } from '../domain-event.interface.js';

interface DummyState {
  name: string;
  count: number;
}

class DummyAggregate extends AggregateRoot {
  protected readonly aggregateType = 'Dummy';
  
  public state: DummyState = { name: '', count: 0 };

  public initialize(id: string, name: string): void {
    const event: DomainEvent<{ id: string; name: string }> = {
      name: 'dummy.initialized',
      metadata: {
        eventId: 'evt-001',
        aggregateId: id,
        aggregateVersion: 1,
        eventVersion: 1,
        occurredAt: new Date().toISOString(),
        recordedAt: new Date().toISOString(),
        actorType: 'USER',
        actorId: 'user-001',
        correlationId: 'corr-001',
        causationId: 'cmd-001',
        tenantId: null
      },
      payload: { id, name }
    };
    this.recordEvent(event);
  }

  public increment(amount: number): void {
    const event: DomainEvent<{ amount: number }> = {
      name: 'dummy.incremented',
      metadata: {
        eventId: 'evt-002',
        aggregateId: this.id,
        aggregateVersion: this.version + 1,
        eventVersion: 1,
        occurredAt: new Date().toISOString(),
        recordedAt: new Date().toISOString(),
        actorType: 'USER',
        actorId: 'user-001',
        correlationId: 'corr-001',
        causationId: 'cmd-002',
        tenantId: null
      },
      payload: { amount }
    };
    this.recordEvent(event);
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'dummy.initialized') {
      const payload = event.payload as { id: string; name: string };
      this.id = payload.id;
      this.state.name = payload.name;
    } else if (event.name === 'dummy.incremented') {
      const payload = event.payload as { amount: number };
      this.state.count += payload.amount;
    }
  }
}

describe('AggregateRoot base class', () => {
  it('should initialize and record events', () => {
    const aggregate = new DummyAggregate();
    aggregate.initialize('agg-123', 'My Test Aggregate');

    expect(aggregate.id).toBe('agg-123');
    expect(aggregate.state.name).toBe('My Test Aggregate');
    expect(aggregate.version).toBe(1);
    expect(aggregate.getUncommittedEvents().length).toBe(1);
    expect(aggregate.getUncommittedEvents()[0]?.name).toBe('dummy.initialized');
  });

  it('should increment aggregate version when events are recorded', () => {
    const aggregate = new DummyAggregate();
    aggregate.initialize('agg-123', 'My Test Aggregate');
    aggregate.increment(5);

    expect(aggregate.state.count).toBe(5);
    expect(aggregate.version).toBe(2);
    expect(aggregate.getUncommittedEvents().length).toBe(2);
  });

  it('should load state from historical events', () => {
    const aggregate = new DummyAggregate();
    const history: DomainEvent[] = [
      {
        name: 'dummy.initialized',
        metadata: {
          eventId: 'evt-001',
          aggregateId: 'agg-123',
          aggregateVersion: 1,
          eventVersion: 1,
          occurredAt: new Date().toISOString(),
          recordedAt: new Date().toISOString(),
          actorType: 'USER',
          actorId: 'user-001',
          correlationId: 'corr-001',
          causationId: 'cmd-001',
          tenantId: null
        },
        payload: { id: 'agg-123', name: 'Loaded from history' }
      },
      {
        name: 'dummy.incremented',
        metadata: {
          eventId: 'evt-002',
          aggregateId: 'agg-123',
          aggregateVersion: 2,
          eventVersion: 1,
          occurredAt: new Date().toISOString(),
          recordedAt: new Date().toISOString(),
          actorType: 'USER',
          actorId: 'user-001',
          correlationId: 'corr-001',
          causationId: 'cmd-002',
          tenantId: null
        },
        payload: { amount: 10 }
      }
    ];

    aggregate.loadFromHistory(history);

    expect(aggregate.id).toBe('agg-123');
    expect(aggregate.state.name).toBe('Loaded from history');
    expect(aggregate.state.count).toBe(10);
    expect(aggregate.version).toBe(2);
    expect(aggregate.getUncommittedEvents().length).toBe(0);
  });
});
