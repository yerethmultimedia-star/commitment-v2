import { Entity } from './entity.js';
import { UniqueEntityId } from './unique-entity-id.js';
import { DomainEvent } from '../core/domain-event.interface.js';

export abstract class AggregateRoot<IdType = UniqueEntityId> extends Entity<IdType> {
  private _uncommittedEvents: DomainEvent[] = [];

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
    }
  }

  protected recordEvent(event: DomainEvent): void {
    this.applyEvent(event);
    this._uncommittedEvents.push(event);
  }

  protected abstract applyEvent(event: DomainEvent): void;
}
