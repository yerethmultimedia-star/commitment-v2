import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommitmentModule } from '../commitment/commitment.module';

import { TasksController } from './api/tasks.controller';

// NestJS Command Handlers
import { RegisterTaskNestjsHandler } from './nestjs/register-task.nestjs-handler';
import { EditTaskNestjsHandler } from './nestjs/edit-task.nestjs-handler';
import { CompleteTaskNestjsHandler } from './nestjs/complete-task.nestjs-handler';
import { ReopenTaskNestjsHandler } from './nestjs/reopen-task.nestjs-handler';
import { ArchiveTaskNestjsHandler } from './nestjs/archive-task.nestjs-handler';
import { RestoreTaskNestjsHandler } from './nestjs/restore-task.nestjs-handler';
import { DeleteTaskNestjsHandler } from './nestjs/delete-task.nestjs-handler';
import { ChangePriorityTaskNestjsHandler } from './nestjs/change-priority-task.nestjs-handler';
import { DuplicateTaskNestjsHandler } from './nestjs/duplicate-task.nestjs-handler';

// Query Handlers
import { ListTasksQueryHandler } from './application/queries/list-tasks.handler';
import { GetTaskByIdQueryHandler } from './application/queries/get-task-by-id.handler';
import { GetDashboardQueryHandler } from './application/queries/get-dashboard.handler';

// Projectors
import { TaskProjectors } from './application/projectors/task.projectors';
import { DashboardProjector } from './application/projectors/dashboard.projector';

// Infrastructure
import { InMemoryTaskRepository } from './infrastructure/in-memory-task.repository';
import { InMemoryTaskProjectionStore } from './infrastructure/in-memory-task-projection.store';
import { InMemoryDashboardProjectionRepository } from './infrastructure/in-memory-dashboard-projection.repository';
import { InMemoryEventStore } from '../infrastructure/event-store/in-memory-event-store';

// Application Services
import { TaskApplicationService } from './application/services/task-application.service';
import { QuickCaptureApplicationService } from './application/services/quick-capture-application.service';

@Module({
  imports: [CqrsModule, CommitmentModule],
  controllers: [TasksController],
  providers: [
    // Application Services
    TaskApplicationService,
    QuickCaptureApplicationService,

    // Command Handlers
    RegisterTaskNestjsHandler,
    EditTaskNestjsHandler,
    CompleteTaskNestjsHandler,
    ReopenTaskNestjsHandler,
    ArchiveTaskNestjsHandler,
    RestoreTaskNestjsHandler,
    DeleteTaskNestjsHandler,
    ChangePriorityTaskNestjsHandler,
    DuplicateTaskNestjsHandler,

    // Query Handlers
    ListTasksQueryHandler,
    GetTaskByIdQueryHandler,
    GetDashboardQueryHandler,

    // Projectors
    ...TaskProjectors,
    DashboardProjector,

    // Infrastructure bindings
    {
      provide: 'TaskRepository',
      useClass: InMemoryTaskRepository,
    },
    {
      provide: 'TaskProjectionStore',
      useClass: InMemoryTaskProjectionStore,
    },
    {
      provide: 'DashboardProjectionRepository',
      useClass: InMemoryDashboardProjectionRepository,
    },
    {
      provide: 'EventStore',
      useClass: InMemoryEventStore,
    },
  ],
  exports: ['TaskRepository', 'EventStore', TaskApplicationService],
})
export class TaskModule {}
