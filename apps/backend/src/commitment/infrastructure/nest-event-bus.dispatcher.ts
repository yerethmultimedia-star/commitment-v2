import { EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DomainEvent } from '@commitment/domain';
import { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

@Injectable()
export class NestEventBusDispatcher implements DomainEventDispatcher {
  constructor(private readonly eventBus: EventBus) {}

  public dispatch(events: readonly DomainEvent[]): Promise<void> {
    this.eventBus.publishAll([...events]);
    return Promise.resolve();
  }
}
