/* eslint-disable @typescript-eslint/unbound-method */
import { OutboxPublisherService } from '../outbox-publisher.service';
import { InMemoryOutboxRepository } from '../../../infrastructure/in-memory-outbox.repository';
import { MessageBroker } from '../../ports/message-broker.port';
import { IntegrationMessage, OutboxStatus } from '@commitment/domain';
import { Logger } from '@nestjs/common';

describe('OutboxPublisherService', () => {
  let service: OutboxPublisherService;
  let repository: InMemoryOutboxRepository;
  let messageBroker: jest.Mocked<MessageBroker>;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    repository = new InMemoryOutboxRepository();
    messageBroker = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    service = new OutboxPublisherService(repository, messageBroker);
  });

  const createMessage = (
    id: string,
    retryCount: number = 0,
  ): IntegrationMessage => {
    return new IntegrationMessage(
      id,
      'TestEvent',
      'v1',
      'agg1',
      1,
      new Date(),
      {},
      'corr',
      'caus',
      OutboxStatus.Pending,
      retryCount,
      undefined,
      undefined,
    );
  };

  it('should publish pending messages and mark them as Published', async () => {
    await repository.append([createMessage('m1')]);

    await service.publishPendingMessages();

    expect(messageBroker.publish).toHaveBeenCalledTimes(1);

    const saved = await repository.nextPending(10);
    expect(saved).toHaveLength(0); // Because it is Published
  });

  it('should mark as Failed and increment retryCount if publishing throws', async () => {
    const msg = createMessage('m1');
    await repository.append([msg]);

    messageBroker.publish.mockRejectedValueOnce(new Error('Broker down'));

    await service.publishPendingMessages();

    const saved = await repository.findById('m1');
    expect(saved).toBeDefined();
    expect(saved!.status).toBe(OutboxStatus.Failed);
    expect(saved!.retryCount).toBe(1);
    expect(saved!.nextAttempt?.getTime()).toBeGreaterThan(Date.now());
  });

  it('should mark as DeadLetter when max retries are reached', async () => {
    const msg = createMessage('m1', 5); // Assuming MAX_RETRIES = 5
    await repository.append([msg]);

    messageBroker.publish.mockRejectedValueOnce(new Error('Broker down again'));

    await service.publishPendingMessages();

    // It should no longer be pending
    const pending = await repository.nextPending(10);
    expect(pending).toHaveLength(0);

    // It should be in the dead letter queue
    const dlq = await repository.getDeadLetterMessages();
    expect(dlq).toHaveLength(1);
    expect(dlq[0].messageId).toBe('m1');
    expect(dlq[0].status).toBe(OutboxStatus.DeadLetter);
    expect(dlq[0].nextAttempt).toBeUndefined();
  });
});
