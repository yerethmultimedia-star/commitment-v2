import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommitmentModule } from '../commitment/commitment.module';
import { GoalsController } from './api/goals.controller';
import { RegisterGoalNestjsHandler } from './nestjs/register-goal.nestjs-handler';
import { RenameGoalNestjsHandler } from './nestjs/rename-goal.nestjs-handler';
import { CompleteGoalNestjsHandler } from './nestjs/complete-goal.nestjs-handler';
import { ArchiveGoalNestjsHandler } from './nestjs/archive-goal.nestjs-handler';
import { LinkCommitmentToGoalNestjsHandler } from './nestjs/link-commitment-to-goal.nestjs-handler';
import { LinkHabitToGoalNestjsHandler } from './nestjs/link-habit-to-goal.nestjs-handler';
import { GetGoalByIdNestjsHandler } from './nestjs/get-goal-by-id.nestjs-handler';
import { ListGoalsNestjsHandler } from './nestjs/list-goals.nestjs-handler';
import { InMemoryGoalRepository } from './infrastructure/in-memory-goal.repository';
import { InMemoryGoalProjectionStore } from './infrastructure/in-memory-goal-projection.store';
import { InMemoryGoalQueryService } from './infrastructure/in-memory-goal.query-service';
import { GoalProjectors } from './application/projectors/goal.projectors';

@Module({
  // Reuses CommitmentModule's exported DomainEventDispatcher (task.module.ts precedent)
  // instead of duplicating a Goal-local NestEventBusDispatcher.
  imports: [CqrsModule, CommitmentModule],
  controllers: [GoalsController],
  providers: [
    RegisterGoalNestjsHandler,
    RenameGoalNestjsHandler,
    CompleteGoalNestjsHandler,
    ArchiveGoalNestjsHandler,
    LinkCommitmentToGoalNestjsHandler,
    LinkHabitToGoalNestjsHandler,
    GetGoalByIdNestjsHandler,
    ListGoalsNestjsHandler,
    ...GoalProjectors,
    {
      provide: 'GoalRepository',
      useClass: InMemoryGoalRepository,
    },
    {
      provide: 'GoalProjectionStore',
      useClass: InMemoryGoalProjectionStore,
    },
    {
      provide: 'GoalQueryService',
      useClass: InMemoryGoalQueryService,
    },
  ],
  exports: ['GoalRepository'],
})
export class GoalModule {}
