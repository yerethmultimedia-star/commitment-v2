import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  TaskRegisteredEvent,
  TaskEditedEvent,
  TaskCompletedEvent,
  TaskReopenedEvent,
  TaskArchivedEvent,
  TaskRestoredEvent,
  TaskDeletedEvent,
  TaskPriorityChangedEvent,
  TaskDueDateChangedEvent,
  TaskRelinkedToGoalEvent,
  TaskRelinkedToCommitmentEvent,
} from '@commitment/domain';
import { InMemoryTaskProjectionStore } from '../../infrastructure/in-memory-task-projection.store';

@EventsHandler(TaskRegisteredEvent)
export class TaskRegisteredProjector implements IEventHandler<TaskRegisteredEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskRegisteredEvent): void {
    this.store.save({
      id: event.payload.taskId,
      identityId: event.payload.identityId,
      title: event.payload.title,
      description: event.payload.description,
      status: event.payload.status,
      priority: event.payload.priority,
      estimatedMinutes: event.payload.estimatedMinutes,
      actualMinutes: 0,
      startDate: null,
      dueDate: event.payload.dueDate ?? null,
      completedAt: null,
      commitmentId: event.payload.commitmentId ?? null,
      goalId: event.payload.goalId ?? null,
      tags: event.payload.tags,
      metadata: event.payload.metadata,
      createdAt: event.payload.createdAt,
      updatedAt: event.payload.createdAt,
      deletedAt: null,
      version: 1,
    });
  }
}

@EventsHandler(TaskEditedEvent)
export class TaskEditedProjector implements IEventHandler<TaskEditedEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskEditedEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    if (event.payload.title !== undefined) view.title = event.payload.title;
    if (event.payload.description !== undefined)
      view.description = event.payload.description ?? '';
    if (event.payload.estimatedMinutes !== undefined)
      view.estimatedMinutes = event.payload.estimatedMinutes;
    if (event.payload.actualMinutes !== undefined)
      view.actualMinutes = event.payload.actualMinutes;
    if (event.payload.startDate !== undefined)
      view.startDate = event.payload.startDate;
    if (event.payload.tags !== undefined) view.tags = event.payload.tags;
    if (event.payload.metadata !== undefined)
      view.metadata = event.payload.metadata;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskCompletedEvent)
export class TaskCompletedProjector implements IEventHandler<TaskCompletedEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskCompletedEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.status = 'completed';
    view.completedAt = event.payload.completedAt;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskReopenedEvent)
export class TaskReopenedProjector implements IEventHandler<TaskReopenedEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskReopenedEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.status = 'pending';
    view.completedAt = null;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskArchivedEvent)
export class TaskArchivedProjector implements IEventHandler<TaskArchivedEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskArchivedEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.status = 'archived';
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskRestoredEvent)
export class TaskRestoredProjector implements IEventHandler<TaskRestoredEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskRestoredEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.status = view.completedAt ? 'completed' : 'pending';
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskDeletedEvent)
export class TaskDeletedProjector implements IEventHandler<TaskDeletedEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskDeletedEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.deletedAt = event.metadata.occurredAt;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskPriorityChangedEvent)
export class TaskPriorityChangedProjector implements IEventHandler<TaskPriorityChangedEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskPriorityChangedEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.priority = event.payload.priority;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskDueDateChangedEvent)
export class TaskDueDateChangedProjector implements IEventHandler<TaskDueDateChangedEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskDueDateChangedEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.dueDate = event.payload.dueDate;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskRelinkedToGoalEvent)
export class TaskRelinkedToGoalProjector implements IEventHandler<TaskRelinkedToGoalEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskRelinkedToGoalEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.goalId = event.payload.goalId;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(TaskRelinkedToCommitmentEvent)
export class TaskRelinkedToCommitmentProjector implements IEventHandler<TaskRelinkedToCommitmentEvent> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public handle(event: TaskRelinkedToCommitmentEvent): void {
    const view = this.store.findById(event.payload.taskId);
    if (!view) return;
    view.commitmentId = event.payload.commitmentId;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

export const TaskProjectors = [
  TaskRegisteredProjector,
  TaskEditedProjector,
  TaskCompletedProjector,
  TaskReopenedProjector,
  TaskArchivedProjector,
  TaskRestoredProjector,
  TaskDeletedProjector,
  TaskPriorityChangedProjector,
  TaskDueDateChangedProjector,
  TaskRelinkedToGoalProjector,
  TaskRelinkedToCommitmentProjector,
];
