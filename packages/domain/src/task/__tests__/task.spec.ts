import { Task } from '../aggregate/Task.js';
import { TaskId } from '../value-objects/task-id.js';
import { TaskTitle } from '../value-objects/task-title.js';
import { TaskDescription } from '../value-objects/task-description.js';
import { TaskPriority, PriorityType } from '../value-objects/task-priority.js';
import { TaskStatus, StatusType } from '../value-objects/task-status.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { CommitmentId } from '../../commitment/value-objects/commitment-id.js';
import { TaskConstraints } from '../constants/task-constraints.js';
import { TaskRegisteredEvent } from '../events/task-registered.event.js';
import { TaskCompletedEvent } from '../events/task-completed.event.js';
import { TaskPriorityChangedEvent } from '../events/task-priority-changed.event.js';
import { TaskDueDateChangedEvent } from '../events/task-due-date-changed.event.js';
import { TaskRelinkedToGoalEvent } from '../events/task-relinked-to-goal.event.js';
import { TaskRelinkedToCommitmentEvent } from '../events/task-relinked-to-commitment.event.js';
import {
  InvalidTaskTitleError,
  InvalidTaskDescriptionError,
  InvalidTaskPriorityError,
  InvalidTaskStatusError,
  TaskAlreadyCompletedError,
  TaskAlreadyArchivedError,
  TaskAlreadyDeletedError,
  TaskCannotBeReopenedError,
  TaskCannotBeArchivedError,
  TaskCannotBeRestoredError,
} from '../errors/task-errors.js';

describe('Task Domain', () => {
  const validId = new TaskId('018f6b5c-0001-7000-8000-111111111111');
  const validIdentityId = new IdentityId('018f6b5c-0002-7000-8000-222222222222');
  const validTitle = new TaskTitle('Implement Task Aggregate');
  const validDescription = new TaskDescription('Build a rich domain model');
  const validPriority = TaskPriority.medium();

  // ─── Value Objects ────────────────────────────────────────────────────────────

  describe('Value Objects', () => {
    describe('TaskId', () => {
      it('should support equality checks', () => {
        const id1 = new TaskId('018f6b5c-0001-7000-8000-aaaaaaaaaaaa');
        const id2 = new TaskId('018f6b5c-0001-7000-8000-aaaaaaaaaaaa');
        const id3 = new TaskId('018f6b5c-0001-7000-8000-bbbbbbbbbbbb');
        expect(id1.equals(id2)).toBe(true);
        expect(id1.equals(id3)).toBe(false);
      });
    });

    describe('TaskTitle', () => {
      it('should trim whitespace and accept valid titles', () => {
        const t = new TaskTitle('  My Task  ');
        expect(t.value).toBe('My Task');
      });

      it('should reject empty or whitespace-only titles', () => {
        expect(() => new TaskTitle('')).toThrow(InvalidTaskTitleError);
        expect(() => new TaskTitle('   ')).toThrow(InvalidTaskTitleError);
        expect(TaskTitle.isValid('')).toBe(false);
        expect(TaskTitle.isValid(null as unknown as string)).toBe(false);
      });

      it('should reject titles exceeding max length', () => {
        const long = 'a'.repeat(TaskConstraints.MAX_TITLE_LENGTH + 1);
        expect(() => new TaskTitle(long)).toThrow(InvalidTaskTitleError);
        expect(TaskTitle.isValid(long)).toBe(false);
      });
    });

    describe('TaskDescription', () => {
      it('should trim whitespace and accept valid descriptions', () => {
        const d = new TaskDescription('  Some description  ');
        expect(d.value).toBe('Some description');
      });

      it('should accept empty descriptions', () => {
        const d = new TaskDescription('');
        expect(d.value).toBe('');
      });

      it('should reject descriptions exceeding max length', () => {
        const long = 'a'.repeat(TaskConstraints.MAX_DESCRIPTION_LENGTH + 1);
        expect(() => new TaskDescription(long)).toThrow(InvalidTaskDescriptionError);
      });
    });

    describe('TaskPriority', () => {
      it('should create priorities via factory methods', () => {
        expect(TaskPriority.low().value).toBe(PriorityType.Low);
        expect(TaskPriority.medium().value).toBe(PriorityType.Medium);
        expect(TaskPriority.high().value).toBe(PriorityType.High);
      });

      it('should reject invalid priority values', () => {
        expect(() => new TaskPriority('critical' as any)).toThrow(InvalidTaskPriorityError);
      });
    });

    describe('TaskStatus', () => {
      it('should create statuses via factory methods', () => {
        expect(TaskStatus.pending().value).toBe(StatusType.Pending);
        expect(TaskStatus.completed().value).toBe(StatusType.Completed);
        expect(TaskStatus.archived().value).toBe(StatusType.Archived);
      });

      it('should reject invalid status values', () => {
        expect(() => new TaskStatus('deleted' as any)).toThrow(InvalidTaskStatusError);
      });
    });
  });

  // ─── Task Aggregate ───────────────────────────────────────────────────────────

  describe('Task Aggregate', () => {
    describe('register()', () => {
      it('should register a task in Pending status and emit TaskRegisteredEvent', () => {
        const task = Task.register(validId, validIdentityId, validTitle, validDescription, validPriority);

        expect(task.id.equals(validId)).toBe(true);
        expect(task.identityId.equals(validIdentityId)).toBe(true);
        expect(task.title.value).toBe(validTitle.value);
        expect(task.description?.value).toBe(validDescription.value);
        expect(task.status.value).toBe(StatusType.Pending);
        expect(task.priority.value).toBe(PriorityType.Medium);
        expect(task.isDeleted).toBe(false);

        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskRegisteredEvent;
        expect(e.name).toBe('task.registered');
        expect(e.payload.taskId).toBe(validId.value);
        expect(e.payload.identityId).toBe(validIdentityId.value);
        expect(e.payload.title).toBe(validTitle.value);
        expect(e.payload.status).toBe(StatusType.Pending);
      });

      it('should register with no description and default optional fields', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(task.description).toBeNull();
        expect(task.dueDate).toBeNull();
        expect(task.commitmentId).toBeNull();
        expect(task.goalId).toBeNull();
        expect(task.tags).toEqual([]);
        expect(task.metadata).toEqual({});
      });

      it('should register with a commitmentId linking to a commitment', () => {
        const commitmentId = new CommitmentId('018f0000-0000-7000-8000-cccccccccccc');
        const task = Task.register(
          validId, validIdentityId, validTitle, null, validPriority,
          30, null, commitmentId
        );
        expect(task.commitmentId?.value).toBe(commitmentId.value);
      });

      it('should register with due date and tags', () => {
        const dueDate = new Date('2030-12-31T23:59:59.000Z');
        const task = Task.register(
          validId, validIdentityId, validTitle, null, validPriority,
          60, dueDate, null, null, ['tag-a', 'tag-b']
        );
        expect(task.dueDate?.toISOString()).toBe(dueDate.toISOString());
        expect(task.tags).toEqual(['tag-a', 'tag-b']);
      });

      it('should increment version to 1 after register', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(task.version).toBe(1);
      });
    });

    describe('complete()', () => {
      it('should complete a pending task and emit TaskCompletedEvent', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.complete();

        expect(task.status.value).toBe(StatusType.Completed);
        expect(task.completedAt).not.toBeNull();

        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskCompletedEvent;
        expect(e.name).toBe('task.completed');
        expect(e.payload.taskId).toBe(validId.value);
      });

      it('should not complete an already-completed task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(() => task.complete()).toThrow(TaskAlreadyCompletedError);
      });

      it('should not complete an archived task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.archive();
        expect(() => task.complete()).toThrow(TaskCannotBeArchivedError);
      });

      it('should not complete a deleted task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.delete();
        expect(() => task.complete()).toThrow(TaskAlreadyDeletedError);
      });

      it('should maintain version count after complete', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(task.version).toBe(2); // register + complete
      });
    });

    describe('reopen()', () => {
      it('should reopen a completed task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        task.clearUncommittedEvents();

        task.reopen();

        expect(task.status.value).toBe(StatusType.Pending);
        expect(task.completedAt).toBeNull();
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]?.name).toBe('task.reopened');
      });

      it('should not reopen a pending task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(() => task.reopen()).toThrow(TaskCannotBeReopenedError);
      });

      it('should not reopen an archived task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.archive();
        expect(() => task.reopen()).toThrow(TaskCannotBeArchivedError);
      });
    });

    describe('archive()', () => {
      it('should archive a pending task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.archive();

        expect(task.status.value).toBe(StatusType.Archived);
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]?.name).toBe('task.archived');
      });

      it('should not archive an already-archived task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.archive();
        expect(() => task.archive()).toThrow(TaskAlreadyArchivedError);
      });

      it('should not archive a deleted task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.delete();
        expect(() => task.archive()).toThrow(TaskAlreadyDeletedError);
      });
    });

    describe('restore()', () => {
      it('should restore an archived task to Pending', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.archive();
        task.clearUncommittedEvents();

        task.restore();

        expect(task.status.value).toBe(StatusType.Pending);
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]?.name).toBe('task.restored');
      });

      it('should not restore a pending task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(() => task.restore()).toThrow(TaskCannotBeRestoredError);
      });
    });

    describe('delete()', () => {
      it('should soft-delete a pending task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.delete();

        expect(task.isDeleted).toBe(true);
        expect(task.deletedAt).not.toBeNull();
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]?.name).toBe('task.deleted');
      });

      it('should not delete an already-deleted task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.delete();
        expect(() => task.delete()).toThrow(TaskAlreadyDeletedError);
      });
    });

    describe('edit()', () => {
      it('should edit title, description and tags and emit an event', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        const newTitle = new TaskTitle('Updated Task Title');
        const newDesc = new TaskDescription('Updated description');
        task.edit(newTitle, newDesc, 45, ['important'], { source: 'manual' });

        expect(task.title.value).toBe('Updated Task Title');
        expect(task.description?.value).toBe('Updated description');
        expect(task.estimatedMinutes).toBe(45);
        expect(task.tags).toEqual(['important']);

        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]?.name).toBe('task.edited');
      });

      it('should not emit an event when nothing changed', () => {
        const task = Task.register(validId, validIdentityId, validTitle, validDescription, validPriority, 30, null, null, null, ['tag1']);
        task.clearUncommittedEvents();

        // Pass the same values
        task.edit(new TaskTitle(validTitle.value), new TaskDescription(validDescription.value), 30, ['tag1']);

        expect(task.getUncommittedEvents()).toHaveLength(0);
      });

      it('should not edit a deleted task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.delete();
        expect(() => task.edit(new TaskTitle('Anything'))).toThrow(TaskAlreadyDeletedError);
      });

      it('should not edit an archived task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.archive();
        expect(() => task.edit(new TaskTitle('Anything'))).toThrow(TaskCannotBeArchivedError);
      });
    });

    describe('changePriority()', () => {
      it('should change priority and emit TaskPriorityChangedEvent', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, TaskPriority.low());
        task.clearUncommittedEvents();

        task.changePriority(TaskPriority.high());

        expect(task.priority.value).toBe(PriorityType.High);
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskPriorityChangedEvent;
        expect(e.name).toBe('task.priority_changed');
        expect(e.payload.priority).toBe(PriorityType.High);
      });

      it('should not emit an event when priority is unchanged', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, TaskPriority.high());
        task.clearUncommittedEvents();
        task.changePriority(TaskPriority.high());
        expect(task.getUncommittedEvents()).toHaveLength(0);
      });
    });

    describe('schedule()', () => {
      it('should set a due date and emit TaskDueDateChangedEvent', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        const dueDate = new Date('2030-06-15T00:00:00.000Z');
        task.schedule(dueDate);

        expect(task.dueDate?.toISOString()).toBe(dueDate.toISOString());
        const events = task.getUncommittedEvents();
        const dueDateEvent = events.find(e => e.name === 'task.due_date_changed') as TaskDueDateChangedEvent;
        expect(dueDateEvent).toBeDefined();
        expect(dueDateEvent.payload.dueDate).toBe(dueDate.toISOString());
      });

      it('should not emit an event if due date is unchanged', () => {
        const dueDate = new Date('2030-06-15T00:00:00.000Z');
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority, 30, dueDate);
        task.clearUncommittedEvents();
        task.schedule(dueDate);
        const dueDateEvents = task.getUncommittedEvents().filter(e => e.name === 'task.due_date_changed');
        expect(dueDateEvents).toHaveLength(0);
      });
    });

    describe('duplicate()', () => {
      it('should create a copy with a new ID and a modified title', () => {
        const task = Task.register(validId, validIdentityId, validTitle, validDescription, validPriority, 60, null, null, null, ['a']);
        task.clearUncommittedEvents();

        const newId = new TaskId('018f6b5c-0003-7000-8000-333333333333');
        const copy = task.duplicate(newId);

        expect(copy.id.value).toBe(newId.value);
        expect(copy.title.value).toBe(`${validTitle.value} (Copy)`);
        expect(copy.description?.value).toBe(validDescription.value);
        expect(copy.tags).toEqual(['a']);
        expect(copy.status.value).toBe(StatusType.Pending);
        expect(copy.completedAt).toBeNull();

        // Original should emit TaskDuplicatedEvent
        const originalEvents = task.getUncommittedEvents();
        const duplicatedEvent = originalEvents.find(e => e.name === 'task.duplicated');
        expect(duplicatedEvent).toBeDefined();
      });

      it('should not duplicate a deleted task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.delete();
        const newId = new TaskId('018f6b5c-0004-7000-8000-444444444444');
        expect(() => task.duplicate(newId)).toThrow(TaskAlreadyDeletedError);
      });
    });

    describe('relinkGoal() / relinkCommitment()', () => {
      const commitmentId = new CommitmentId('018f0000-0000-7000-8000-cccccccccccc');
      const goalId = '018f0000-0000-7000-8000-999999999999';

      it('links a goal-independent, commitment-independent task to a Goal', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.relinkGoal(goalId, new Date());

        expect(task.goalId).toBe(goalId);
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskRelinkedToGoalEvent;
        expect(e.name).toBe('task.relinked_to_goal');
        expect(e.payload.goalId).toBe(goalId);
      });

      it('relinkGoal(null) removes an existing goal link', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority, 0, null, null, goalId);
        task.clearUncommittedEvents();

        task.relinkGoal(null, new Date());

        expect(task.goalId).toBeNull();
      });

      it('is a no-op and records no event when the goal is unchanged', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority, 0, null, null, goalId);
        task.clearUncommittedEvents();

        task.relinkGoal(goalId, new Date());

        expect(task.getUncommittedEvents()).toHaveLength(0);
      });

      it('links a task to a Commitment', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.relinkCommitment(commitmentId, new Date());

        expect(task.commitmentId?.value).toBe(commitmentId.value);
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskRelinkedToCommitmentEvent;
        expect(e.name).toBe('task.relinked_to_commitment');
        expect(e.payload.commitmentId).toBe(commitmentId.value);
      });

      it('relinkCommitment(null) removes an existing commitment link', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority, 0, null, commitmentId);
        task.clearUncommittedEvents();

        task.relinkCommitment(null, new Date());

        expect(task.commitmentId).toBeNull();
      });

      it('linking to a Goal clears an existing Commitment link (mutual exclusivity)', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority, 0, null, commitmentId);
        task.clearUncommittedEvents();

        task.relinkGoal(goalId, new Date());

        expect(task.goalId).toBe(goalId);
        expect(task.commitmentId).toBeNull();
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(2);
        expect(events[0]?.name).toBe('task.relinked_to_goal');
        expect(events[1]?.name).toBe('task.relinked_to_commitment');
        expect((events[1] as TaskRelinkedToCommitmentEvent).payload.commitmentId).toBeNull();
      });

      it('linking to a Commitment clears an existing direct Goal link (mutual exclusivity)', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority, 0, null, null, goalId);
        task.clearUncommittedEvents();

        task.relinkCommitment(commitmentId, new Date());

        expect(task.commitmentId?.value).toBe(commitmentId.value);
        expect(task.goalId).toBeNull();
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(2);
        expect(events[0]?.name).toBe('task.relinked_to_commitment');
        expect(events[1]?.name).toBe('task.relinked_to_goal');
        expect((events[1] as TaskRelinkedToGoalEvent).payload.goalId).toBeNull();
      });

      it('blocks relinkGoal on an archived task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.archive();
        expect(() => task.relinkGoal(goalId, new Date())).toThrow(TaskCannotBeArchivedError);
      });

      it('blocks relinkCommitment on a deleted task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.delete();
        expect(() => task.relinkCommitment(commitmentId, new Date())).toThrow(TaskAlreadyDeletedError);
      });
    });

    describe('Event Sourcing (loadFromHistory)', () => {
      it('should rehydrate task from event stream', () => {
        const task = Task.register(validId, validIdentityId, validTitle, validDescription, validPriority, 30);
        task.changePriority(TaskPriority.high());
        task.complete();

        const events = [...task.getUncommittedEvents()];

        // Create a fresh aggregate and replay events
        const rehydrated = Task.register(
          new TaskId('018f6b5c-ffff-7000-8000-ffffffffffff'),
          validIdentityId,
          new TaskTitle('Temporary'),
          null,
          TaskPriority.low()
        );
        rehydrated.loadFromHistory(events);

        expect(rehydrated.status.value).toBe(StatusType.Completed);
        expect(rehydrated.priority.value).toBe(PriorityType.High);
        expect(rehydrated.completedAt).not.toBeNull();
      });

      it('should maintain correct version after replaying history', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(task.version).toBe(2); // registered + completed
      });
    });
  });
});
