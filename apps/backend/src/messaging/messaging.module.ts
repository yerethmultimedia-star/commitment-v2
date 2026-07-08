import { Module } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { OUTBOX_REPOSITORY_TOKEN } from './application/ports/outbox.repository.port';
import { MESSAGE_BROKER_TOKEN } from './application/ports/message-broker.port';
import { InMemoryOutboxRepository } from './infrastructure/in-memory-outbox.repository';
import { InMemoryMessageBroker } from './infrastructure/in-memory-message.broker';
import { OutboxPublisherService } from './application/services/outbox-publisher.service';

@Module({
  imports: [CqrsModule, ScheduleModule.forRoot()],
  providers: [
    {
      provide: OUTBOX_REPOSITORY_TOKEN,
      useClass: InMemoryOutboxRepository,
    },
    {
      provide: MESSAGE_BROKER_TOKEN,
      useFactory: (eventBus: EventBus) => {
        return new InMemoryMessageBroker(eventBus);
      },
      inject: [EventBus],
    },
    OutboxPublisherService,
  ],
  exports: [OUTBOX_REPOSITORY_TOKEN, MESSAGE_BROKER_TOKEN],
})
export class MessagingModule {}
