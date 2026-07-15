import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommitmentModule } from '../commitment/commitment.module';

import { HabitsController } from './api/habits.controller';

// NestJS Command Handlers
import { RegisterHabitNestjsHandler } from './nestjs/register-habit.nestjs-handler';
import { EditHabitNestjsHandler } from './nestjs/edit-habit.nestjs-handler';
import { CompleteHabitNestjsHandler } from './nestjs/complete-habit.nestjs-handler';
import { UncompleteHabitNestjsHandler } from './nestjs/uncomplete-habit.nestjs-handler';
import { PostponeHabitNestjsHandler } from './nestjs/postpone-habit.nestjs-handler';
import { EnableHabitNestjsHandler } from './nestjs/enable-habit.nestjs-handler';
import { DisableHabitNestjsHandler } from './nestjs/disable-habit.nestjs-handler';
import { ArchiveHabitNestjsHandler } from './nestjs/archive-habit.nestjs-handler';

// Query Handlers
import { ListHabitsQueryHandler } from './application/queries/list-habits.handler';
import { GetHabitByIdQueryHandler } from './application/queries/get-habit-by-id.handler';

// Projectors
import { HabitProjectors } from './application/projectors/habit.projectors';

// Infrastructure
import { InMemoryHabitRepository } from './infrastructure/in-memory-habit.repository';
import { InMemoryHabitProjectionStore } from './infrastructure/in-memory-habit-projection.store';

// Application Services
import { HabitApplicationService } from './application/services/habit-application.service';

@Module({
  imports: [CqrsModule, CommitmentModule],
  controllers: [HabitsController],
  providers: [
    // Application Services
    HabitApplicationService,

    // Command Handlers
    RegisterHabitNestjsHandler,
    EditHabitNestjsHandler,
    CompleteHabitNestjsHandler,
    UncompleteHabitNestjsHandler,
    PostponeHabitNestjsHandler,
    EnableHabitNestjsHandler,
    DisableHabitNestjsHandler,
    ArchiveHabitNestjsHandler,

    // Query Handlers
    ListHabitsQueryHandler,
    GetHabitByIdQueryHandler,

    // Projectors
    ...HabitProjectors,

    // Infrastructure bindings
    {
      provide: 'HabitRepository',
      useClass: InMemoryHabitRepository,
    },
    {
      provide: 'HabitProjectionStore',
      useClass: InMemoryHabitProjectionStore,
    },
  ],
  exports: ['HabitRepository', 'HabitProjectionStore', HabitApplicationService],
})
export class HabitModule {}
