import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CqrsModule } from '@nestjs/cqrs';
import { MetricsController } from './metrics.controller';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { CommitmentModule } from './commitment/commitment.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [CqrsModule, CommitmentModule, NotificationsModule],
  controllers: [AppController, MetricsController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
