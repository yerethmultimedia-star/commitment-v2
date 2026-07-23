import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReminderExecutionEngine } from '../application/ports/reminder-execution-engine.port';

@Injectable()
export class BullMQExecutionEngine
  implements ReminderExecutionEngine, OnModuleInit
{
  private readonly logger = new Logger(BullMQExecutionEngine.name);

  constructor(@InjectQueue('reminders') private readonly queue: Queue) {}

  // AR-054/D-054.1: BullMQ's Queue re-emits any underlying ioredis connection
  // error as its own EventEmitter 'error' event — with no listener attached,
  // Node throws it as an uncaught exception (there is no @OnQueueEvent
  // equivalent for the injected Queue itself; that decorator targets a
  // separate QueueEvents connection, not this one).
  onModuleInit(): void {
    this.queue.on('error', (error: Error) => {
      this.logger.error(
        `BullMQ Queue error on "reminders": ${error.message}`,
        error.stack,
      );
    });
  }

  public async enqueue(reminderId: string): Promise<void> {
    this.logger.debug(`Enqueueing reminder ${reminderId} to BullMQ`);
    await this.queue.add(
      'process-reminder',
      { reminderId },
      {
        jobId: reminderId, // Use reminderId as jobId to prevent duplicates if enqueued multiple times
      },
    );
  }

  public async cancel(reminderId: string): Promise<void> {
    const job = await this.queue.getJob(reminderId);
    if (job) {
      await job.remove();
      this.logger.debug(`Removed job ${reminderId} from BullMQ`);
    }
  }
}
