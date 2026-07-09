import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OUTBOX_REPOSITORY_TOKEN } from '../ports/outbox.repository.port';
import type { OutboxRepository } from '../ports/outbox.repository.port';
import { MESSAGE_BROKER_TOKEN } from '../ports/message-broker.port';
import type { MessageBroker } from '../ports/message-broker.port';
import { OutboxStatus } from '@commitment/domain';
import { RequestContext } from '@commitment/shared';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private isPublishing = false;
  private readonly MAX_RETRIES = 5;

  constructor(
    @Inject(OUTBOX_REPOSITORY_TOKEN)
    private readonly outboxRepository: OutboxRepository,
    @Inject(MESSAGE_BROKER_TOKEN)
    private readonly messageBroker: MessageBroker,
    @InjectMetric('outbox_deadletter_total')
    private readonly deadLetterCounter: Counter<string>,
    @InjectMetric('processed_messages_total')
    private readonly processedMessagesCounter: Counter<string>,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async publishPendingMessages() {
    return RequestContext.runWithNewContext(async () => {
      if (this.isPublishing) {
        return;
      }
      this.isPublishing = true;

      try {
        const messages = await this.outboxRepository.nextPending(100);

        if (messages.length === 0) {
          return;
        }

        // Mark as Publishing
        for (const msg of messages) {
          msg.status = OutboxStatus.Publishing;
        }
        await this.outboxRepository.saveMany(messages);

        // Publish and confirm
        for (const msg of messages) {
          try {
            msg.lastAttempt = new Date();
            msg.retryCount += 1;

            await this.messageBroker.publish(msg);

            msg.status = OutboxStatus.Published;
            this.processedMessagesCounter.inc();
          } catch (error) {
            this.logger.error(
              `Failed to publish message ${msg.messageId}:`,
              error,
            );

            if (msg.retryCount >= this.MAX_RETRIES) {
              this.logger.warn(
                `Message ${msg.messageId} reached MAX_RETRIES (${this.MAX_RETRIES}). Moving to DeadLetter queue.`,
              );
              msg.status = OutboxStatus.DeadLetter;
              msg.nextAttempt = undefined; // Do not retry automatically
              this.deadLetterCounter.inc();
            } else {
              msg.status = OutboxStatus.Failed;
              // Exponential backoff for retries (e.g. 2^retryCount * 5 seconds)
              msg.nextAttempt = new Date(
                Date.now() + Math.pow(2, msg.retryCount) * 5000,
              );
            }
          }
        }

        await this.outboxRepository.saveMany(messages);
      } catch (error) {
        this.logger.error('Error during Outbox processing', error);
      } finally {
        this.isPublishing = false;
      }
    });
  }
}
