import { Entity } from './entity.js';
import { UniqueEntityId } from './unique-entity-id.js';
import { DomainEvent } from '../core/domain-event.interface.js';

export abstract class AggregateRoot<IdType = UniqueEntityId> extends Entity<IdType> {







  public get version(): number {
    return this._version;
  }
  private _uncommittedEvents: DomainEvent[] = [];
  private _version: number = 0;

  protected constructor(id: IdType) {
    super(id);
  }

  public getUncommittedEvents(): readonly DomainEvent[] {
    return Object.freeze([...this._uncommittedEvents]);
  }

  public clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  public loadFromHistory(events: readonly DomainEvent[]): void {
    for (const event of events) {
      this.applyEvent(event);
      this._version = event.metadata.aggregateVersion;
    }
  }

  protected recordEvent(event: DomainEvent): void {
    // Every event increments the version: version represents the aggregate's position
    // in the event stream, not solely the number of state transitions.
    this._version += 1;
    // Apply the event to mutate state.
    this.applyEvent(event);
    // Record the event for later publishing.
    this._uncommittedEvents.push(event);
  }

  protected abstract applyEvent(event: DomainEvent): void;
}
