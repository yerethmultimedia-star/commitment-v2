import { EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DomainEvent } from '@commitment/domain';
import { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';
import { RequestContext } from '@commitment/shared';
import * as crypto from 'crypto';

@Injectable()
export class NestEventBusDispatcher implements DomainEventDispatcher {
  constructor(private readonly eventBus: EventBus) {}

  public dispatch(events: readonly DomainEvent[]): Promise<void> {
    const correlationId = RequestContext.currentCorrelationId() || '';
    const causationId = RequestContext.currentCausationId() || '';

    const enrichedEvents = events.map((event) => {
      // We mutate the metadata object directly to inject the observability context
      // This keeps the Domain pure and unaware of logging/tracing concerns
      const metadata = event.metadata as unknown as Record<string, unknown>;
      if (!metadata.correlationId) {
        metadata.correlationId = correlationId;
      }
      if (!metadata.causationId) {
        metadata.causationId = causationId;
      }
      if (!metadata.eventId) {
        metadata.eventId = crypto.randomUUID();
      }
      return event;
    });

    this.eventBus.publishAll([...enrichedEvents]);
    return Promise.resolve();
  }
}
