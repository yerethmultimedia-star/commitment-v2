import { DomainEvent } from '@commitment/domain';
import { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

export class NoOpDomainEventDispatcher implements DomainEventDispatcher {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public dispatch(_events: readonly DomainEvent[]): Promise<void> {
    return Promise.resolve();
  }
}
