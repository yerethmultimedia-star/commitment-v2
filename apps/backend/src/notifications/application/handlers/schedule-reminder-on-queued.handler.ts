import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationMessage } from '@commitment/domain';
import { Inject, Logger } from '@nestjs/common';
import type { ReminderExecutionEngine } from '../ports/reminder-execution-engine.port';

@EventsHandler(IntegrationMessage)
export class ScheduleReminderOnQueuedHandler implements IEventHandler<IntegrationMessage> {
  private readonly logger = new Logger(ScheduleReminderOnQueuedHandler.name);

  constructor(
    @Inject('ReminderExecutionEngine')
    private readonly executionEngine: ReminderExecutionEngine,
  ) {}

  async handle(event: IntegrationMessage) {
    // IntegrationMessage handlers receive ALL integration messages. We must filter.
    if (event.type !== 'ReminderQueued') {
      return;
    }

    this.logger.debug(
      `Received IntegrationMessage ReminderQueued for reminder ${event.payload.reminderId}`,
    );

    // We pass 0 as delay since the dispatcher only marks them queued when they are READY to be sent.
    // The ExecutionEngine will send it immediately (or as fast as the queue processes).
    const payload = event.payload as Record<string, unknown>;
    const reminderId =
      typeof payload['reminderId'] === 'string'
        ? payload['reminderId']
        : String(payload['reminderId']);
    await this.executionEngine.enqueue(reminderId);
  }
}
