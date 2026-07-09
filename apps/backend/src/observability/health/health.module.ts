import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { OutboxBacklogIndicator } from './outbox-backlog.indicator';
import { ProjectionLagIndicator } from './projection-lag.indicator';
import { MessagingModule } from '../../messaging/messaging.module';

@Module({
  imports: [TerminusModule, MessagingModule],
  controllers: [HealthController],
  providers: [OutboxBacklogIndicator, ProjectionLagIndicator],
})
export class HealthModule {}
