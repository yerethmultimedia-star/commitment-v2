import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ReminderWorkerService } from '../application/services/reminder-worker.service';

@Processor('reminders')
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(private readonly reminderWorkerService: ReminderWorkerService) {
    super();
  }

  async process(job: Job<{ reminderId: string }, any, string>): Promise<any> {
    this.logger.debug(
      `Processing job ${job.id} for reminder ${job.data.reminderId}`,
    );
    await this.reminderWorkerService.process(job.data.reminderId);
  }

  // AR-054/D-054.1: without this, an ioredis connection error surfaces as an
  // unhandled EventEmitter 'error' (Node throws when no listener is attached),
  // non-deterministically attributed to whatever else is running at the time.
  @OnWorkerEvent('error')
  onError(error: Error): void {
    this.logger.error(
      `BullMQ Worker error on queue "reminders": ${error.message}`,
      error.stack,
    );
  }
}
