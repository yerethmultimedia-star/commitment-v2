import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationMessage } from '@commitment/domain';
import { Inject, Logger } from '@nestjs/common';
import type { ReminderExecutionEngine } from '../ports/reminder-execution-engine.port';
import { PROCESSED_MESSAGE_REPOSITORY_TOKEN } from '../../../messaging/application/ports/processed-message.repository.port';
import type { ProcessedMessageRepository } from '../../../messaging/application/ports/processed-message.repository.port';

@EventsHandler(IntegrationMessage)
export class ScheduleReminderOnQueuedHandler implements IEventHandler<IntegrationMessage> {
  private readonly logger = new Logger(ScheduleReminderOnQueuedHandler.name);

  constructor(
    @Inject('ReminderExecutionEngine')
    private readonly executionEngine: ReminderExecutionEngine,
    @Inject(PROCESSED_MESSAGE_REPOSITORY_TOKEN)
    private readonly processedMessageRepository: ProcessedMessageRepository,
  ) {}

  async handle(event: IntegrationMessage) {
    // IntegrationMessage handlers receive ALL integration messages. We must filter.
    if (event.type !== 'ReminderQueued') {
      return;
    }

    this.logger.debug(
      `Received IntegrationMessage ReminderQueued for reminder ${event.payload.reminderId}`,
    );

    const consumerName = this.constructor.name;
    const claimed = await this.processedMessageRepository.tryBeginProcessing(
      event.messageId,
      consumerName,
    );

    if (!claimed) {
      this.logger.debug(
        `Message ${event.messageId} already processed or processing by ${consumerName}. Skipping.`,
      );
      return;
    }

    try {
      const payload = event.payload as Record<string, unknown>;
      const reminderId =
        typeof payload['reminderId'] === 'string'
          ? payload['reminderId']
          : String(payload['reminderId']);

      await this.executionEngine.enqueue(reminderId);

      await this.processedMessageRepository.markCompleted(
        event.messageId,
        consumerName,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.processedMessageRepository.markFailed(
        event.messageId,
        consumerName,
        errorMessage,
      );
      throw error; // Rethrow to allow retry from the caller (Outbox)
    }
  }
}
