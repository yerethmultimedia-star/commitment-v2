import { MessageBroker } from '../application/ports/message-broker.port';
import { IntegrationMessage } from '@commitment/domain';
import { EventBus } from '@nestjs/cqrs';

export class InMemoryMessageBroker implements MessageBroker {
  constructor(private readonly eventBus: EventBus) {}

  async publish(message: IntegrationMessage): Promise<void> {
    // Route the integration message to the internal NestJS EventBus
    // Handlers mapped via @EventsHandler(IntegrationMessage) or custom decorators can listen to it.
    // However, @nestjs/cqrs routes by the constructor's class name.
    // We can wrap the IntegrationMessage in a class that specifies its type for better dispatching if needed,
    // or just publish the message object and use a generic handler.
    // Wait, the NestJS CQRS EventBus determines the event name using `event.constructor.name`.
    // Since we just have `IntegrationMessage` class, ALL integration messages would trigger handlers for `IntegrationMessage`.
    // Handlers will need to filter by `message.type`.
    this.eventBus.publish(message);
    return Promise.resolve();
  }
}
