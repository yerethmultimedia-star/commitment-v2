import { DomainEvent } from '@commitment/domain';

export interface DomainEventDispatcher {
  dispatch(events: readonly DomainEvent[]): Promise<void>;
}
