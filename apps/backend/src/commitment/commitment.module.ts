import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommitmentsController } from './api/commitments.controller';
import { RegisterCommitmentNestjsHandler } from './nestjs/register-commitment.nestjs-handler';
import { ActivateCommitmentNestjsHandler } from './nestjs/activate-commitment.nestjs-handler';
import { InMemoryCommitmentRepository } from './infrastructure/in-memory-commitment.repository';
import { NoOpDomainEventDispatcher } from './infrastructure/noop-event-dispatcher';

@Module({
  imports: [CqrsModule],
  controllers: [CommitmentsController],
  providers: [
    RegisterCommitmentNestjsHandler,
    ActivateCommitmentNestjsHandler,
    {
      provide: 'CommitmentRepository',
      useClass: InMemoryCommitmentRepository,
    },
    {
      provide: 'DomainEventDispatcher',
      useClass: NoOpDomainEventDispatcher,
    },
  ],
  exports: ['CommitmentRepository', 'DomainEventDispatcher'],
})
export class CommitmentModule {}
