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
import { ExpoNotificationProvider } from './infrastructure/expo-notification-provider';
import { ReminderProcessor } from './infrastructure/reminder.processor';
import { InMemoryNotificationDeviceProjectionRepository } from './infrastructure/in-memory-notification-device-projection.repository';
import { ScheduleReminderOnQueuedHandler } from './application/handlers/schedule-reminder-on-queued.handler';
import { ReminderQueuedMessageMapper } from './application/mappers/reminder-queued-message.mapper';
import { UpdateDeviceProjectionOnRegisteredHandler } from './application/handlers/update-device-projection-on-registered.handler';
import { UpdateDeviceProjectionOnUpdatedHandler } from './application/handlers/update-device-projection-on-updated.handler';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    CqrsModule,
    MessagingModule,
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
    UpdateDeviceProjectionOnRegisteredHandler,
    UpdateDeviceProjectionOnUpdatedHandler,
    ScheduleReminderOnQueuedHandler,
    ReminderQueuedMessageMapper,
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
      useFactory: () => {
        if (process.env.NOTIFICATION_PROVIDER === 'expo') {
          return new ExpoNotificationProvider();
        }
        return new ConsoleNotificationProvider();
      },
    },
    {
      provide: 'ReminderSchedulerPort',
      useClass: InMemoryReminderScheduler,
    },
    {
      provide: 'NotificationDeviceProjectionRepository',
      useClass: InMemoryNotificationDeviceProjectionRepository,
    },
  ],
})
export class NotificationsModule {}
