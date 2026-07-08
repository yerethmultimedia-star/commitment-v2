import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReminderExecutionEngine } from '../application/ports/reminder-execution-engine.port';

@Injectable()
export class BullMQExecutionEngine implements ReminderExecutionEngine {
  private readonly logger = new Logger(BullMQExecutionEngine.name);

  constructor(@InjectQueue('reminders') private readonly queue: Queue) {}

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
