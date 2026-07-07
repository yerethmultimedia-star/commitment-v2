import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommitmentsController } from './api/commitments.controller';
import { RegisterCommitmentNestjsHandler } from './nestjs/register-commitment.nestjs-handler';
import { ActivateCommitmentNestjsHandler } from './nestjs/activate-commitment.nestjs-handler';
import { PauseCommitmentNestjsHandler } from './nestjs/pause-commitment.nestjs-handler';
import { ResumeCommitmentNestjsHandler } from './nestjs/resume-commitment.nestjs-handler';
import { CompleteCommitmentNestjsHandler } from './nestjs/complete-commitment.nestjs-handler';
import { CancelCommitmentNestjsHandler } from './nestjs/cancel-commitment.nestjs-handler';
import { GetCommitmentByIdNestjsHandler } from './nestjs/get-commitment-by-id.nestjs-handler';
import { ListCommitmentsNestjsHandler } from './nestjs/list-commitments.nestjs-handler';
import { InMemoryCommitmentRepository } from './infrastructure/in-memory-commitment.repository';
import { NestEventBusDispatcher } from './infrastructure/nest-event-bus.dispatcher';
import { InMemoryCommitmentProjectionStore } from './infrastructure/in-memory-commitment-projection.store';
import { InMemoryCommitmentQueryService } from './infrastructure/in-memory-commitment.query-service';
import { CommitmentProjectors } from './application/projectors/commitment.projectors';

@Module({
  imports: [CqrsModule],
  controllers: [CommitmentsController],
  providers: [
    RegisterCommitmentNestjsHandler,
    ActivateCommitmentNestjsHandler,
    PauseCommitmentNestjsHandler,
    ResumeCommitmentNestjsHandler,
    CompleteCommitmentNestjsHandler,
    CancelCommitmentNestjsHandler,
    GetCommitmentByIdNestjsHandler,
    ListCommitmentsNestjsHandler,
    ...CommitmentProjectors,
    {
      provide: 'CommitmentRepository',
      useClass: InMemoryCommitmentRepository,
    },
    {
      provide: 'DomainEventDispatcher',
      useClass: NestEventBusDispatcher,
    },
    {
      provide: 'CommitmentProjectionStore',
      useClass: InMemoryCommitmentProjectionStore,
    },
    {
      provide: 'CommitmentQueryService',
      useClass: InMemoryCommitmentQueryService,
    },
  ],
  exports: ['CommitmentRepository', 'DomainEventDispatcher'],
})
export class CommitmentModule {}
