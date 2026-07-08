import { Module } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { OUTBOX_REPOSITORY_TOKEN } from './application/ports/outbox.repository.port';
import { MESSAGE_BROKER_TOKEN } from './application/ports/message-broker.port';
import { PROCESSED_MESSAGE_REPOSITORY_TOKEN } from './application/ports/processed-message.repository.port';
import { InMemoryOutboxRepository } from './infrastructure/in-memory-outbox.repository';
import { InMemoryMessageBroker } from './infrastructure/in-memory-message.broker';
import { InMemoryProcessedMessageRepository } from './infrastructure/in-memory-processed-message.repository';
import { OutboxPublisherService } from './application/services/outbox-publisher.service';
import { MessagingController } from './api/messaging.controller';

@Module({
  imports: [ScheduleModule.forRoot(), CqrsModule],
  controllers: [MessagingController],
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
    {
      provide: PROCESSED_MESSAGE_REPOSITORY_TOKEN,
      useClass: InMemoryProcessedMessageRepository,
    },
    OutboxPublisherService,
  ],
  exports: [
    OUTBOX_REPOSITORY_TOKEN,
    MESSAGE_BROKER_TOKEN,
    PROCESSED_MESSAGE_REPOSITORY_TOKEN,
  ],
})
export class MessagingModule {}
