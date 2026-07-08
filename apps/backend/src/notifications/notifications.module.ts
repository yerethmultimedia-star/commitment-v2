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

@Module({
  imports: [CqrsModule],
  providers: [
    ScheduleReminderOnActivationHandler,
    SuspendReminderOnPauseHandler,
    RescheduleReminderOnResumeHandler,
    CancelReminderOnCompletedHandler,
    CancelReminderOnCancelledHandler,
    {
      provide: 'ReminderRepository',
      useClass: InMemoryReminderRepository,
    },
    {
      provide: 'ReminderSchedulerPort',
      useClass: InMemoryReminderScheduler,
    },
  ],
})
export class NotificationsModule {}
