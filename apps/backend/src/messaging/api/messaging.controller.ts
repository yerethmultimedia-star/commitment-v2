import {
  Controller,
  Get,
  Post,
  Param,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { OUTBOX_REPOSITORY_TOKEN } from '../application/ports/outbox.repository.port';
import type { OutboxRepository } from '../application/ports/outbox.repository.port';
import { OutboxStatus } from '@commitment/domain';

@Controller('messaging')
export class MessagingController {
  constructor(
    @Inject(OUTBOX_REPOSITORY_TOKEN)
    private readonly outboxRepository: OutboxRepository,
  ) {}

  @Get('outbox/dead-letter')
  async getDeadLetterMessages() {
    const messages = await this.outboxRepository.getDeadLetterMessages();
    return {
      count: messages.length,
      messages: messages.map((msg) => ({
        messageId: msg.messageId,
        type: msg.type,
        occurredAt: msg.occurredAt,
        retryCount: msg.retryCount,
        lastAttempt: msg.lastAttempt,
      })),
    };
  }

  @Post('outbox/:id/retry')
  async retryDeadLetterMessage(@Param('id') id: string) {
    const message = await this.outboxRepository.findById(id);

    if (!message) {
      throw new NotFoundException(`Message with id ${id} not found in Outbox`);
    }

    if (message.status !== OutboxStatus.DeadLetter) {
      return {
        success: false,
        reason: `Message is in status ${message.status}, only DeadLetter messages can be retried.`,
      };
    }

    message.status = OutboxStatus.Pending;
    message.retryCount = 0;
    message.nextAttempt = new Date();

    await this.outboxRepository.saveMany([message]);

    return {
      success: true,
      messageId: id,
      newStatus: message.status,
    };
  }
}
