import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleReminderOnActivationHandler } from './application/handlers/schedule-reminder-on-activation.handler';
import { SuspendReminderOnPauseHandler } from './application/handlers/suspend-reminder-on-pause.handler';
import { RescheduleReminderOnResumeHandler } from './application/handlers/reschedule-reminder-on-resume.handler';
import {
  CancelReminderOnCompletedHandler,
  CancelReminderOnCancelledHandler,
} from './application/handlers/cancel-reminder-on-terminal-state.handler';
import { InMemoryReminderScheduler } from './infrastructure/in-memory-reminder-scheduler';
import { InMemoryReminderRepository } from './infrastructure/in-memory-reminder.repository';
import { BullModule } from '@nestjs/bullmq';
import { ReminderDispatcher } from './application/services/reminder-dispatcher.service';
import { ReminderWorkerService } from './application/services/reminder-worker.service';
import { BullMQExecutionEngine } from './infrastructure/bullmq-execution-engine';
import { ConsoleNotificationProvider } from './infrastructure/console-notification-provider';
import { ReminderProcessor } from './infrastructure/reminder.processor';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  providers: [
    ScheduleReminderOnActivationHandler,
    SuspendReminderOnPauseHandler,
    RescheduleReminderOnResumeHandler,
    CancelReminderOnCompletedHandler,
    CancelReminderOnCancelledHandler,
    ReminderDispatcher,
    ReminderWorkerService,
    ReminderProcessor,
    {
      provide: 'ReminderRepository',
      useClass: InMemoryReminderRepository,
    },
    {
      provide: 'ReminderExecutionEngine',
      useClass: BullMQExecutionEngine,
    },
    {
      provide: 'NotificationProvider',
      useClass: ConsoleNotificationProvider,
    },
    {
      provide: 'ReminderSchedulerPort',
      useClass: InMemoryReminderScheduler,
    },
  ],
})
export class NotificationsModule {}
