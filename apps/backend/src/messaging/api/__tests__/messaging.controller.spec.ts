import { MessagingController } from '../messaging.controller';
import { InMemoryOutboxRepository } from '../../infrastructure/in-memory-outbox.repository';
import { IntegrationMessage, OutboxStatus } from '@commitment/domain';
import { NotFoundException } from '@nestjs/common';

describe('MessagingController', () => {
  let controller: MessagingController;
  let repository: InMemoryOutboxRepository;

  beforeEach(() => {
    repository = new InMemoryOutboxRepository();
    controller = new MessagingController(repository);
  });

  const createMessage = (
    id: string,
    status: OutboxStatus,
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
      status,
      status === OutboxStatus.DeadLetter ? 5 : 0,
      undefined,
      undefined,
    );
  };

  describe('getDeadLetterMessages', () => {
    it('should return only messages in DeadLetter status', async () => {
      await repository.append([
        createMessage('m1', OutboxStatus.Pending),
        createMessage('m2', OutboxStatus.DeadLetter),
        createMessage('m3', OutboxStatus.Published),
        createMessage('m4', OutboxStatus.DeadLetter),
      ]);

      const result = await controller.getDeadLetterMessages();
      expect(result.count).toBe(2);
      expect(result.messages.map((m) => m.messageId)).toEqual(['m2', 'm4']);
    });
  });

  describe('retryDeadLetterMessage', () => {
    it('should throw NotFoundException if message does not exist', async () => {
      await expect(
        controller.retryDeadLetterMessage('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return success: false if message is not in DeadLetter status', async () => {
      await repository.append([createMessage('m1', OutboxStatus.Pending)]);

      const result = (await controller.retryDeadLetterMessage('m1')) as {
        success: boolean;
        reason: string;
      };
      expect(result.success).toBe(false);
      expect(result.reason).toBe(
        'Message is in status Pending, only DeadLetter messages can be retried.',
      );
    });

    it('should reset retryCount and set status to Pending for a DeadLetter message', async () => {
      await repository.append([createMessage('m2', OutboxStatus.DeadLetter)]);

      const result = (await controller.retryDeadLetterMessage('m2')) as {
        success: boolean;
        newStatus: string;
      };
      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(OutboxStatus.Pending);

      const savedMessage = await repository.findById('m2');
      expect(savedMessage?.status).toBe(OutboxStatus.Pending);
      expect(savedMessage?.retryCount).toBe(0);
      expect(savedMessage?.nextAttempt).toBeDefined();
    });
  });
});
