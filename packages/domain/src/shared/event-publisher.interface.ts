import { DomainEvent } from '../core/domain-event.interface.js';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: readonly DomainEvent[]): Promise<void>;
}
