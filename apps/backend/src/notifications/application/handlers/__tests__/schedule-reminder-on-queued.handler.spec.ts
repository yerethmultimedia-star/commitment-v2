/* eslint-disable @typescript-eslint/unbound-method */
import { ScheduleReminderOnQueuedHandler } from '../schedule-reminder-on-queued.handler';
import { ReminderExecutionEngine } from '../../ports/reminder-execution-engine.port';
import { InMemoryProcessedMessageRepository } from '../../../../messaging/infrastructure/in-memory-processed-message.repository';
import { IntegrationMessage, OutboxStatus } from '@commitment/domain';
import { Logger } from '@nestjs/common';

describe('ScheduleReminderOnQueuedHandler', () => {
  let executionEngine: jest.Mocked<ReminderExecutionEngine>;
  let repository: InMemoryProcessedMessageRepository;
  let handler: ScheduleReminderOnQueuedHandler;

  beforeEach(() => {
    // Disable logging for cleaner test output
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    executionEngine = {
      enqueue: jest.fn().mockResolvedValue(undefined),
    };
    repository = new InMemoryProcessedMessageRepository();
    handler = new ScheduleReminderOnQueuedHandler(executionEngine, repository);
  });

  const createEvent = (messageId: string): IntegrationMessage => {
    return new IntegrationMessage(
      messageId,
      'ReminderQueued',
      'v1',
      'agg1',
      1,
      new Date(),
      { reminderId: 'rem1', scheduledFor: new Date().toISOString() },
      'corr1',
      'caus1',
      OutboxStatus.Published,
      0,
      undefined,
      undefined,
    );
  };

  it('should ignore non-ReminderQueued events', async () => {
    const event = createEvent('msg-1');
    Object.defineProperty(event, 'type', { value: 'OtherEvent' });

    await handler.handle(event);

    expect(executionEngine.enqueue).not.toHaveBeenCalled();
  });

  it('should process a message and enqueue it exactly once (Deduplication)', async () => {
    const event = createEvent('msg-1');

    await handler.handle(event);
    expect(executionEngine.enqueue).toHaveBeenCalledTimes(1);

    // Second call should be ignored
    await handler.handle(event);
    expect(executionEngine.enqueue).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should allow concurrent identical messages to be processed exactly once (Concurrency)', async () => {
    const event = createEvent('msg-1');

    // Fire them at the exact same time
    await Promise.all([
      handler.handle(event),
      handler.handle(event),
      handler.handle(event),
    ]);

    expect(executionEngine.enqueue).toHaveBeenCalledTimes(1);
  });

  it('should retry after failure and then mark as completed', async () => {
    const event = createEvent('msg-failed');

    executionEngine.enqueue.mockRejectedValueOnce(
      new Error('BullMQ connection error'),
    );

    await expect(handler.handle(event)).rejects.toThrow(
      'BullMQ connection error',
    );

    // Enqueue was called but threw an error
    expect(executionEngine.enqueue).toHaveBeenCalledTimes(1);

    // Now simulate the Outbox Publisher retrying it
    executionEngine.enqueue.mockResolvedValueOnce(undefined);

    await handler.handle(event);

    expect(executionEngine.enqueue).toHaveBeenCalledTimes(2); // Called again successfully

    // A third call should be ignored because it completed
    await handler.handle(event);
    expect(executionEngine.enqueue).toHaveBeenCalledTimes(2);
  });

  it('should isolate states by consumer name', async () => {
    const event = createEvent('msg-isolate');

    await handler.handle(event);
    expect(executionEngine.enqueue).toHaveBeenCalledTimes(1);

    // Manually mark it processing for a DIFFERENT consumer
    const claimed = await repository.tryBeginProcessing(
      'msg-isolate',
      'AnotherConsumer',
    );
    expect(claimed).toBe(true); // Should be true, because AnotherConsumer hasn't processed it
  });
});
