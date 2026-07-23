import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CqrsModule } from '@nestjs/cqrs';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { CommitmentModule } from './commitment/commitment.module';
import { TaskModule } from './task/task.module';
import { HabitModule } from './habit/habit.module';
import { GoalModule } from './goal/goal.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DevicesModule } from './devices/devices.module';
import { MessagingModule } from './messaging/messaging.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { RequestContextMiddleware } from './observability/middleware/request-context.middleware';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { RequestContext } from '@commitment/shared';
import { ObservabilityModule } from './observability/observability.module';
import { HealthModule } from './observability/health/health.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from './observability/interceptors/metrics.interceptor';

import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => {
          const ctx = RequestContext.current();
          return ctx
            ? {
                correlationId: ctx.correlationId,
                causationId: ctx.causationId,
                requestId: ctx.requestId,
                identityId: ctx.identityId,
              }
            : {};
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    HealthModule,
    ObservabilityModule,
    CqrsModule,
    CommitmentModule,
    TaskModule,
    HabitModule,
    GoalModule,
    NotificationsModule,
    DevicesModule,
    MessagingModule,
    AuthenticationModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT
          ? parseInt(process.env.REDIS_PORT, 10)
          : 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, RequestContextMiddleware)
      .forRoutes('*');
  }
}
