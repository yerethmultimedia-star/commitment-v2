import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommitmentModule } from '../commitment/commitment.module';
import { HabitModule } from '../habit/habit.module';

import { TasksController } from './api/tasks.controller';

// NestJS Command Handlers
import { RegisterTaskNestjsHandler } from './nestjs/register-task.nestjs-handler';
import { EditTaskNestjsHandler } from './nestjs/edit-task.nestjs-handler';
import { CompleteTaskNestjsHandler } from './nestjs/complete-task.nestjs-handler';
import { ReopenTaskNestjsHandler } from './nestjs/reopen-task.nestjs-handler';
import { StartTaskNestjsHandler } from './nestjs/start-task.nestjs-handler';
import { BlockTaskNestjsHandler } from './nestjs/block-task.nestjs-handler';
import { UnblockTaskNestjsHandler } from './nestjs/unblock-task.nestjs-handler';
import { CancelTaskNestjsHandler } from './nestjs/cancel-task.nestjs-handler';
import { ReturnTaskToPendingNestjsHandler } from './nestjs/return-task-to-pending.nestjs-handler';
import { DeleteTaskNestjsHandler } from './nestjs/delete-task.nestjs-handler';
import { ChangePriorityTaskNestjsHandler } from './nestjs/change-priority-task.nestjs-handler';
import { DuplicateTaskNestjsHandler } from './nestjs/duplicate-task.nestjs-handler';
import { RelinkTaskGoalNestjsHandler } from './nestjs/relink-task-goal.nestjs-handler';
import { RelinkTaskCommitmentNestjsHandler } from './nestjs/relink-task-commitment.nestjs-handler';
import { CreateTaskDependencyNestjsHandler } from './nestjs/create-task-dependency.nestjs-handler';
import { ScheduleTaskNestjsHandler } from './nestjs/schedule-task.nestjs-handler';
// ADR-022 §3.2 — registered here, not CommitmentModule, to avoid a circular
// module dependency (TaskModule already imports CommitmentModule).
import { ActivateCommitmentNestjsHandler } from './nestjs/activate-commitment.nestjs-handler';

// Sagas
import { TaskDependencyCascadeSaga } from './application/sagas/task-dependency-cascade.saga'; // ADR-022 §5
import { CancelTasksOnCommitmentCompletedSaga } from './application/sagas/cancel-tasks-on-commitment-completed.saga'; // ADR-022 §6.1

// Query Handlers
import { ListTasksQueryHandler } from './application/queries/list-tasks.handler';
import { GetTaskByIdQueryHandler } from './application/queries/get-task-by-id.handler';
import { GetDashboardQueryHandler } from './application/queries/get-dashboard.handler';

// Projectors
import { TaskProjectors } from './application/projectors/task.projectors';
import { DashboardProjector } from './application/projectors/dashboard.projector';

// Infrastructure
import { InMemoryTaskRepository } from './infrastructure/in-memory-task.repository';
import { InMemoryTaskDependencyRepository } from './infrastructure/in-memory-task-dependency.repository';
import { InMemoryTaskProjectionStore } from './infrastructure/in-memory-task-projection.store';
import { InMemoryDashboardProjectionRepository } from './infrastructure/in-memory-dashboard-projection.repository';
import { InMemoryEventStore } from '../infrastructure/event-store/in-memory-event-store';

// Application Services
import { TaskApplicationService } from './application/services/task-application.service';
import { QuickCaptureApplicationService } from './application/services/quick-capture-application.service';

// Command Preconditions (ADR-022 §3)
import { TaskBasedCommitmentActivationPreconditions } from './application/preconditions/commitment-activation.preconditions';
import { TaskReopenPreconditions } from './application/preconditions/task-reopen.preconditions';
import type { TaskVersionedRepository } from './application/ports/task-versioned-repository.port';
import type { VersionedCommitmentRepository } from '../commitment/application/ports/versioned-commitment-repository.port';

@Module({
  imports: [CqrsModule, CommitmentModule, HabitModule],
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
    StartTaskNestjsHandler,
    BlockTaskNestjsHandler,
    UnblockTaskNestjsHandler,
    CancelTaskNestjsHandler,
    ReturnTaskToPendingNestjsHandler,
    DeleteTaskNestjsHandler,
    ChangePriorityTaskNestjsHandler,
    DuplicateTaskNestjsHandler,
    RelinkTaskGoalNestjsHandler,
    RelinkTaskCommitmentNestjsHandler,
    CreateTaskDependencyNestjsHandler,
    ScheduleTaskNestjsHandler,
    ActivateCommitmentNestjsHandler,

    // Sagas
    TaskDependencyCascadeSaga,
    CancelTasksOnCommitmentCompletedSaga,

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
      provide: 'TaskDependencyRepository',
      useClass: InMemoryTaskDependencyRepository,
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

    // Command Preconditions (ADR-022 §3) — factory providers since these
    // classes take a repository as a constructor argument rather than being
    // resolved by NestJS's own class-token injection.
    {
      provide: 'CommitmentActivationPreconditions',
      useFactory: (taskRepository: TaskVersionedRepository) =>
        new TaskBasedCommitmentActivationPreconditions(taskRepository),
      inject: ['TaskRepository'],
    },
    {
      provide: 'TaskReopenPreconditions',
      useFactory: (commitmentRepository: VersionedCommitmentRepository) =>
        new TaskReopenPreconditions(commitmentRepository),
      inject: ['CommitmentRepository'],
    },
  ],
  exports: ['TaskRepository', 'EventStore', TaskApplicationService],
})
export class TaskModule {}
