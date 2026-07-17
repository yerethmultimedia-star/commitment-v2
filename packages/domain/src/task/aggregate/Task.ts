import { AggregateRoot } from '../../shared/aggregate-root.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { TaskId } from '../value-objects/task-id.js';
import { TaskTitle } from '../value-objects/task-title.js';
import { TaskDescription } from '../value-objects/task-description.js';
import { TaskPriority, PriorityType } from '../value-objects/task-priority.js';
import { TaskStatus, StatusType } from '../value-objects/task-status.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { CommitmentId } from '../../commitment/value-objects/commitment-id.js';

import { TaskRegisteredEvent } from '../events/task-registered.event.js';
import { TaskEditedEvent } from '../events/task-edited.event.js';
import { TaskCompletedEvent } from '../events/task-completed.event.js';
import { TaskReopenedEvent } from '../events/task-reopened.event.js';
import { TaskArchivedEvent } from '../events/task-archived.event.js';
import { TaskRestoredEvent } from '../events/task-restored.event.js';
import { TaskDeletedEvent } from '../events/task-deleted.event.js';
import { TaskPriorityChangedEvent } from '../events/task-priority-changed.event.js';
import { TaskDueDateChangedEvent } from '../events/task-due-date-changed.event.js';
import { TaskDuplicatedEvent } from '../events/task-duplicated.event.js';
import { TaskRelinkedToGoalEvent } from '../events/task-relinked-to-goal.event.js';
import { TaskRelinkedToCommitmentEvent } from '../events/task-relinked-to-commitment.event.js';

import {
  TaskAlreadyCompletedError,
  TaskAlreadyArchivedError,
  TaskAlreadyDeletedError,
  TaskCannotBeReopenedError,
  TaskCannotBeArchivedError,
  TaskCannotBeRestoredError,
} from '../errors/task-errors.js';

export interface TaskProps {
  identityId: IdentityId;
  title: TaskTitle;
  description: TaskDescription | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number;
  actualMinutes: number;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  commitmentId: CommitmentId | null;
  goalId: string | null;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Task extends AggregateRoot<TaskId> {
  private _props!: TaskProps;

  private constructor(id: TaskId) {
    super(id);
  }

  // Getters
  public get identityId(): IdentityId { return this._props.identityId; }
  public get title(): TaskTitle { return this._props.title; }
  public get description(): TaskDescription | null { return this._props.description; }
  public get status(): TaskStatus { return this._props.status; }
  public get priority(): TaskPriority { return this._props.priority; }
  public get estimatedMinutes(): number { return this._props.estimatedMinutes; }
  public get actualMinutes(): number { return this._props.actualMinutes; }
  public get startDate(): Date | null { return this._props.startDate; }
  public get dueDate(): Date | null { return this._props.dueDate; }
  public get completedAt(): Date | null { return this._props.completedAt; }
  public get commitmentId(): CommitmentId | null { return this._props.commitmentId; }
  public get goalId(): string | null { return this._props.goalId; }
  public get tags(): string[] { return [...this._props.tags]; }
  public get metadata(): Record<string, any> { return { ...this._props.metadata }; }
  public get createdAt(): Date { return this._props.createdAt; }
  public get updatedAt(): Date { return this._props.updatedAt; }
  public get deletedAt(): Date | null | undefined { return this._props.deletedAt; }
  public get isDeleted(): boolean { return !!this._props.deletedAt; }

  // Behaviors
  public static register(
    id: TaskId,
    identityId: IdentityId,
    title: TaskTitle,
    description: TaskDescription | null,
    priority: TaskPriority,
    estimatedMinutes: number = 0,
    dueDate: Date | null = null,
    commitmentId: CommitmentId | null = null,
    goalId: string | null = null,
    tags: string[] = [],
    metadata: Record<string, any> = {}
  ): Task {
    const task = new Task(id);
    const now = new Date();
    
    const event = new TaskRegisteredEvent(
      id.value,
      {
        taskId: id.value,
        identityId: identityId.value,
        title: title.value,
        description: description ? description.value : '',
        priority: priority.value,
        status: StatusType.Pending,
        estimatedMinutes,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        commitmentId: commitmentId ? commitmentId.value : undefined,
        goalId: goalId ? goalId : undefined,
        tags,
        metadata,
        createdAt: now.toISOString()
      }
    );
    task.recordEvent(event);
    return task;
  }

  public edit(
    title?: TaskTitle,
    description?: TaskDescription | null,
    estimatedMinutes?: number,
    tags?: string[],
    metadata?: Record<string, any>
  ): void {
    this.ensureNotDeleted();
    this.ensureNotArchived();

    let hasChanges = false;
    if (title && title.value !== this._props.title.value) hasChanges = true;
    
    const currentDesc = this._props.description ? this._props.description.value : '';
    const newDesc = description ? description.value : (description === null ? '' : currentDesc);
    if (description !== undefined && currentDesc !== newDesc) hasChanges = true;
    
    if (estimatedMinutes !== undefined && estimatedMinutes !== this._props.estimatedMinutes) hasChanges = true;
    
    if (tags !== undefined && JSON.stringify(tags) !== JSON.stringify(this._props.tags)) hasChanges = true;
    if (metadata !== undefined && JSON.stringify(metadata) !== JSON.stringify(this._props.metadata)) hasChanges = true;

    if (!hasChanges) return;

    const event = new TaskEditedEvent(
      this.id.value,
      {
        taskId: this.id.value,
        title: title ? title.value : undefined,
        description: description !== undefined ? (description ? description.value : '') : undefined,
        estimatedMinutes,
        tags,
        metadata
      }
    );
    this.recordEvent(event);
  }

  public complete(actualMinutes?: number): void {
    this.ensureNotDeleted();
    this.ensureNotArchived();

    if (this._props.status.value === StatusType.Completed) {
      throw new TaskAlreadyCompletedError('Task is already completed');
    }

    const now = new Date();
    const event = new TaskCompletedEvent(
      this.id.value,
      {
        taskId: this.id.value,
        completedAt: now.toISOString()
      }
    );
    this.recordEvent(event);

    if (actualMinutes !== undefined) {
      this.estimate(this._props.estimatedMinutes, actualMinutes);
    }
  }

  public reopen(): void {
    this.ensureNotDeleted();
    this.ensureNotArchived();

    if (this._props.status.value !== StatusType.Completed) {
      throw new TaskCannotBeReopenedError('Only completed tasks can be reopened');
    }

    const event = new TaskReopenedEvent(
      this.id.value,
      { taskId: this.id.value }
    );
    this.recordEvent(event);
  }

  public archive(): void {
    this.ensureNotDeleted();

    if (this._props.status.value === StatusType.Archived) {
      throw new TaskAlreadyArchivedError('Task is already archived');
    }

    const event = new TaskArchivedEvent(
      this.id.value,
      { taskId: this.id.value }
    );
    this.recordEvent(event);
  }

  public restore(): void {
    this.ensureNotDeleted();

    if (this._props.status.value !== StatusType.Archived) {
      throw new TaskCannotBeRestoredError('Only archived tasks can be restored');
    }

    const event = new TaskRestoredEvent(
      this.id.value,
      { taskId: this.id.value }
    );
    this.recordEvent(event);
  }

  public delete(): void {
    if (this.isDeleted) {
      throw new TaskAlreadyDeletedError('Task is already deleted');
    }

    const event = new TaskDeletedEvent(
      this.id.value,
      { taskId: this.id.value }
    );
    this.recordEvent(event);
  }

  public changePriority(priority: TaskPriority): void {
    this.ensureNotDeleted();
    this.ensureNotArchived();

    if (this._props.priority.value === priority.value) return;

    const event = new TaskPriorityChangedEvent(
      this.id.value,
      {
        taskId: this.id.value,
        priority: priority.value
      }
    );
    this.recordEvent(event);
  }

  public schedule(dueDate: Date | null, startDate: Date | null = null): void {
    this.ensureNotDeleted();
    this.ensureNotArchived();

    const currentDueDate = this._props.dueDate ? this._props.dueDate.toISOString() : null;
    const newDueDate = dueDate ? dueDate.toISOString() : null;
    
    if (currentDueDate === newDueDate && startDate === this._props.startDate) return;

    const event = new TaskDueDateChangedEvent(
      this.id.value,
      {
        taskId: this.id.value,
        dueDate: newDueDate
      }
    );
    this.recordEvent(event);
    
    if (startDate !== undefined) {
      const editEvent = new TaskEditedEvent(
        this.id.value,
        {
          taskId: this.id.value,
          startDate: startDate ? startDate.toISOString() : null
        }
      );
      this.recordEvent(editEvent);
    }
  }

  public estimate(estimatedMinutes: number, actualMinutes?: number): void {
    this.ensureNotDeleted();
    
    if (this._props.estimatedMinutes === estimatedMinutes && this._props.actualMinutes === actualMinutes) return;

    const event = new TaskEditedEvent(
      this.id.value,
      {
        taskId: this.id.value,
        estimatedMinutes,
        actualMinutes
      }
    );
    this.recordEvent(event);
  }

  /**
   * Links this task directly to a Goal, or clears the link with `goalId: null`.
   * A task's Goal and Commitment links are mutually exclusive — linking to a
   * Goal directly clears any existing Commitment link, since the Goal would
   * otherwise be ambiguous (direct vs. resolved-through-the-commitment).
   */
  public relinkGoal(goalId: string | null, now: Date = new Date()): void {
    this.ensureNotDeleted();
    this.ensureNotArchived();

    if (goalId === this._props.goalId) return;

    const event = new TaskRelinkedToGoalEvent(
      this.id.value,
      { taskId: this.id.value, goalId },
      now.toISOString()
    );
    this.recordEvent(event);

    if (goalId !== null && this._props.commitmentId !== null) {
      const clearCommitmentEvent = new TaskRelinkedToCommitmentEvent(
        this.id.value,
        { taskId: this.id.value, commitmentId: null },
        now.toISOString()
      );
      this.recordEvent(clearCommitmentEvent);
    }
  }

  /**
   * Links this task to a Commitment, or clears the link with `commitmentId: null`.
   * Mutually exclusive with a direct Goal link — see relinkGoal().
   */
  public relinkCommitment(commitmentId: CommitmentId | null, now: Date = new Date()): void {
    this.ensureNotDeleted();
    this.ensureNotArchived();

    const currentValue = this._props.commitmentId ? this._props.commitmentId.value : null;
    const newValue = commitmentId ? commitmentId.value : null;
    if (newValue === currentValue) return;

    const event = new TaskRelinkedToCommitmentEvent(
      this.id.value,
      { taskId: this.id.value, commitmentId: newValue },
      now.toISOString()
    );
    this.recordEvent(event);

    if (commitmentId !== null && this._props.goalId !== null) {
      const clearGoalEvent = new TaskRelinkedToGoalEvent(
        this.id.value,
        { taskId: this.id.value, goalId: null },
        now.toISOString()
      );
      this.recordEvent(clearGoalEvent);
    }
  }

  public duplicate(newId: TaskId): Task {
    this.ensureNotDeleted();
    
    const newTask = Task.register(
      newId,
      this._props.identityId,
      new TaskTitle(`${this._props.title.value} (Copy)`),
      this._props.description,
      this._props.priority,
      this._props.estimatedMinutes,
      this._props.dueDate,
      this._props.commitmentId,
      this._props.goalId,
      this._props.tags,
      this._props.metadata
    );

    const event = new TaskDuplicatedEvent(
      this.id.value,
      {
        originalTaskId: this.id.value,
        newTaskId: newId.value
      }
    );
    this.recordEvent(event);

    return newTask;
  }

  private ensureNotDeleted(): void {
    if (this.isDeleted) {
      throw new TaskAlreadyDeletedError('Operation not allowed on deleted task');
    }
  }

  private ensureNotArchived(): void {
    if (this._props.status.value === StatusType.Archived) {
      throw new TaskCannotBeArchivedError('Operation not allowed on archived task');
    }
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'task.registered') {
      const payload = (event as TaskRegisteredEvent).payload;
      this._props = {
        identityId: new IdentityId(payload.identityId),
        title: new TaskTitle(payload.title),
        description: payload.description ? new TaskDescription(payload.description) : null,
        priority: new TaskPriority(payload.priority as PriorityType),
        status: new TaskStatus(StatusType.Pending),
        estimatedMinutes: payload.estimatedMinutes,
        actualMinutes: 0,
        startDate: null,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        completedAt: null,
        commitmentId: payload.commitmentId ? new CommitmentId(payload.commitmentId) : null,
        goalId: payload.goalId || null,
        tags: payload.tags || [],
        metadata: payload.metadata || {},
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.createdAt),
      };
    } else if (event.name === 'task.edited') {
      const payload = (event as TaskEditedEvent).payload;
      if (payload.title !== undefined) this._props.title = new TaskTitle(payload.title);
      if (payload.description !== undefined) this._props.description = payload.description ? new TaskDescription(payload.description) : null;
      if (payload.estimatedMinutes !== undefined) this._props.estimatedMinutes = payload.estimatedMinutes;
      if (payload.actualMinutes !== undefined) this._props.actualMinutes = payload.actualMinutes;
      if (payload.startDate !== undefined) this._props.startDate = payload.startDate ? new Date(payload.startDate) : null;
      if (payload.tags !== undefined) this._props.tags = payload.tags;
      if (payload.metadata !== undefined) this._props.metadata = payload.metadata;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.completed') {
      const payload = (event as TaskCompletedEvent).payload;
      this._props.status = new TaskStatus(StatusType.Completed);
      this._props.completedAt = new Date(payload.completedAt);
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.reopened') {
      this._props.status = new TaskStatus(StatusType.Pending);
      this._props.completedAt = null;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.archived') {
      this._props.status = new TaskStatus(StatusType.Archived);
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.restored') {
      this._props.status = new TaskStatus(this._props.completedAt ? StatusType.Completed : StatusType.Pending);
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.deleted') {
      this._props.deletedAt = new Date(event.metadata.occurredAt);
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.priority_changed') {
      const payload = (event as TaskPriorityChangedEvent).payload;
      this._props.priority = new TaskPriority(payload.priority as PriorityType);
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.due_date_changed') {
      const payload = (event as TaskDueDateChangedEvent).payload;
      this._props.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.relinked_to_goal') {
      const payload = (event as TaskRelinkedToGoalEvent).payload;
      this._props.goalId = payload.goalId;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'task.relinked_to_commitment') {
      const payload = (event as TaskRelinkedToCommitmentEvent).payload;
      this._props.commitmentId = payload.commitmentId ? new CommitmentId(payload.commitmentId) : null;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    }
  }
}
