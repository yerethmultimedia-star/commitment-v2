import { EventStore, DomainEvent } from '@commitment/domain';
import { Injectable, ConflictException } from '@nestjs/common';

@Injectable()
export class InMemoryEventStore implements EventStore {
  private readonly streams = new Map<string, DomainEvent[]>();

  saveEvents(
    streamId: string,
    expectedVersion: number,
    events: readonly DomainEvent[],
  ): Promise<void> {
    const currentEvents = this.streams.get(streamId) || [];
    const currentVersion = currentEvents.length;

    if (currentVersion !== expectedVersion) {
      throw new ConflictException(
        `Optimistic Concurrency Conflict: stream '${streamId}' is at version ${currentVersion}, expected version ${expectedVersion}`,
      );
    }

    const versionedEvents = events.map((event, index) => {
      return {
        ...event,
        metadata: {
          ...event.metadata,
          eventVersion: currentVersion + index + 1,
          recordedAt: new Date().toISOString(),
        },
      };
    });

    this.streams.set(streamId, [...currentEvents, ...versionedEvents]);
    return Promise.resolve();
  }

  getEvents(
    streamId: string,
    fromVersion?: number,
  ): Promise<readonly DomainEvent[]> {
    const events = this.streams.get(streamId) || [];
    if (fromVersion !== undefined) {
      const filtered = events.filter(
        (event) => event.metadata.eventVersion >= fromVersion,
      );
      return Promise.resolve(filtered);
    }
    return Promise.resolve(events);
  }
}
