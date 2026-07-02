import { DomainEvent } from './domain-event.interface.js';

export abstract class AggregateRoot {
  protected abstract readonly aggregateType: string;
  
  private _id!: string;
  private _version = 0;
  private _uncommittedEvents: DomainEvent[] = [];

  public get id(): string {
    return this._id;
  }

  protected set id(value: string) {
    this._id = value;
  }

  public get version(): number {
    return this._version;
  }

  /**
   * Reconstruct aggregate state from a stream of historical events.
   */
  public loadFromHistory(events: readonly DomainEvent[]): void {
    for (const event of events) {
      if (this._version === 0) {
        this._id = event.metadata.aggregateId;
      }
      this.applyEvent(event);
      this._version = event.metadata.aggregateVersion;
    }
  }

  /**
   * Gets all events recorded but not yet persisted.
   */
  public getUncommittedEvents(): readonly DomainEvent[] {
    return this._uncommittedEvents;
  }

  /**
   * Clears the list of uncommitted events.
   */
  public clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  /**
   * Records a new domain event, applying it immediately to the local state.
   */
  protected recordEvent(event: DomainEvent): void {
    this.applyEvent(event);
    this._version = event.metadata.aggregateVersion;
    this._uncommittedEvents.push(event);
  }

  /**
   * Abstract method that subclasses must implement to apply state mutations
   * based on the specific domain event.
   */
  protected abstract applyEvent(event: DomainEvent): void;
}
