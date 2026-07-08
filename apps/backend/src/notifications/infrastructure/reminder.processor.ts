import { Processor, WorkerHost } from '@nestjs/bullmq';
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
}
