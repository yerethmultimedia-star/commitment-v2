import { DomainEvent } from './domain-event.interface.js';

export interface EventStore {
  /**
   * Saves a list of uncommitted events to a stream.
   * Emits an optimistic concurrency conflict error (OCC) if the expected version doesn't match the current stream version.
   * 
   * @param streamId The canonical stream identifier.
   * @param expectedVersion The version of the aggregate root before applying new events.
   * @param events The array of domain events to persist.
   */
  saveEvents(
    streamId: string,
    expectedVersion: number,
    events: readonly DomainEvent[]
  ): Promise<void>;

  /**
   * Retrieves events from a stream, starting from an optional version number.
   * 
   * @param streamId The canonical stream identifier.
   * @param fromVersion The version number to start reading from (inclusive).
   */
  getEvents(
    streamId: string,
    fromVersion?: number
  ): Promise<readonly DomainEvent[]>;
}
