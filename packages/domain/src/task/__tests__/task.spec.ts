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
import { TaskStartedEvent } from '../events/task-started.event.js';
import { TaskBlockedEvent } from '../events/task-blocked.event.js';
import { TaskUnblockedEvent } from '../events/task-unblocked.event.js';
import { TaskCancelledEvent } from '../events/task-cancelled.event.js';
import { TaskReturnedToPendingEvent } from '../events/task-returned-to-pending.event.js';
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
  TaskAlreadyCancelledError,
  TaskAlreadyDeletedError,
  TaskCannotBeCompletedError,
  TaskCannotBeReopenedError,
  TaskReopenBlockedByCommitmentError,
  TaskCannotBeStartedError,
  TaskCannotBeBlockedError,
  TaskCannotBeUnblockedError,
  TaskCannotBeUnblockedManuallyError,
  TaskCannotBeCancelledError,
  TaskCannotReturnToPendingError,
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
        expect(TaskStatus.inProgress().value).toBe(StatusType.InProgress);
        expect(TaskStatus.blocked().value).toBe(StatusType.Blocked);
        expect(TaskStatus.completed().value).toBe(StatusType.Completed);
        expect(TaskStatus.cancelled().value).toBe(StatusType.Cancelled);
      });

      it('should reject invalid status values', () => {
        expect(() => new TaskStatus('archived' as any)).toThrow(InvalidTaskStatusError);
        expect(() => new TaskStatus('deferred' as any)).toThrow(InvalidTaskStatusError);
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
        expect(task.blockedType).toBeNull();
        expect(task.blockedReason).toBeNull();

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

    describe('start()', () => {
      it('should move Pending -> In Progress and emit TaskStartedEvent', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.start();

        expect(task.status.value).toBe(StatusType.InProgress);
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskStartedEvent;
        expect(e.name).toBe('task.started');
        expect(e.payload.taskId).toBe(validId.value);
      });

      it('is never reached automatically — only Start moves to In Progress', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(task.status.value).toBe(StatusType.Pending);
      });

      it('rejects starting a task that is already In Progress', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        expect(() => task.start()).toThrow(TaskCannotBeStartedError);
      });

      it('rejects starting a Completed task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(() => task.start()).toThrow(TaskCannotBeStartedError);
      });
    });

    describe('complete()', () => {
      it('should complete a pending task and emit TaskCompletedEvent (Pending -> Completed, skipping In Progress)', () => {
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

      it('should complete an In Progress task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        task.complete();
        expect(task.status.value).toBe(StatusType.Completed);
      });

      it('should not complete an already-completed task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(() => task.complete()).toThrow(TaskAlreadyCompletedError);
      });

      it('should not complete a Blocked task directly — must Unblock first', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('manual');
        expect(() => task.complete()).toThrow(TaskCannotBeCompletedError);
      });

      it('should not complete a Cancelled task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.cancel();
        expect(() => task.complete()).toThrow(TaskCannotBeCompletedError);
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

    describe('block() / unblock()', () => {
      it('blocks a Pending task manually and remembers Pending as the pre-block status', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.block('manual', 'Waiting on design review');

        expect(task.status.value).toBe(StatusType.Blocked);
        expect(task.blockedType).toBe('manual');
        expect(task.blockedReason).toBe('Waiting on design review');
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskBlockedEvent;
        expect(e.name).toBe('task.blocked');
        expect(e.payload.previousStatus).toBe(StatusType.Pending);
      });

      it('blocks an In Progress task and remembers In Progress as the pre-block status', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        task.clearUncommittedEvents();

        task.block('dependency');

        expect(task.status.value).toBe(StatusType.Blocked);
        const events = task.getUncommittedEvents();
        expect((events[0] as TaskBlockedEvent).payload.previousStatus).toBe(StatusType.InProgress);
      });

      it('rejects blocking a Completed or Cancelled task', () => {
        const completed = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        completed.complete();
        expect(() => completed.block('manual')).toThrow(TaskCannotBeBlockedError);

        const cancelled = Task.register(
          new TaskId('018f6b5c-0001-7000-8000-999999999998'),
          validIdentityId, validTitle, null, validPriority
        );
        cancelled.cancel();
        expect(() => cancelled.block('manual')).toThrow(TaskCannotBeBlockedError);
      });

      it('manually unblocks a manual-blocked task, restoring Pending', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('manual');
        task.clearUncommittedEvents();

        task.unblock('manual');

        expect(task.status.value).toBe(StatusType.Pending);
        expect(task.blockedType).toBeNull();
        expect(task.blockedReason).toBeNull();
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        const e = events[0] as TaskUnblockedEvent;
        expect(e.name).toBe('task.unblocked');
        expect(e.payload.source).toBe('manual');
        expect(e.payload.resultingStatus).toBe(StatusType.Pending);
      });

      it('manually unblocks back to In Progress when that was the pre-block status', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        task.block('manual');

        task.unblock('manual');

        expect(task.status.value).toBe(StatusType.InProgress);
      });

      it('REJECTS manual unblock on a dependency-blocked task (ADR-022 §4.2)', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('dependency');

        expect(() => task.unblock('manual')).toThrow(TaskCannotBeUnblockedManuallyError);
        expect(task.status.value).toBe(StatusType.Blocked);
      });

      it('allows system (automatic) unblock on a dependency-blocked task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('dependency');
        task.clearUncommittedEvents();

        task.unblock('system');

        expect(task.status.value).toBe(StatusType.Pending);
        const events = task.getUncommittedEvents();
        expect((events[0] as TaskUnblockedEvent).payload.source).toBe('system');
      });

      it('allows system unblock on a manual-blocked task too (no restriction on that side)', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('manual');
        expect(() => task.unblock('system')).not.toThrow();
      });

      it('rejects unblocking a task that is not Blocked', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(() => task.unblock('manual')).toThrow(TaskCannotBeUnblockedError);
      });
    });

    describe('cancel()', () => {
      it('cancels a Pending task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.clearUncommittedEvents();

        task.cancel();

        expect(task.status.value).toBe(StatusType.Cancelled);
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect((events[0] as TaskCancelledEvent).name).toBe('task.cancelled');
      });

      it('cancels an In Progress task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        task.cancel();
        expect(task.status.value).toBe(StatusType.Cancelled);
      });

      it('cancels a Blocked task (available even while blocked)', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('dependency');
        task.cancel();
        expect(task.status.value).toBe(StatusType.Cancelled);
      });

      it('rejects cancelling an already-cancelled task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.cancel();
        expect(() => task.cancel()).toThrow(TaskAlreadyCancelledError);
      });

      it('rejects cancelling a Completed task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(() => task.cancel()).toThrow(TaskCannotBeCancelledError);
      });
    });

    describe('returnToPending()', () => {
      it('moves In Progress -> Pending', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        task.clearUncommittedEvents();

        task.returnToPending();

        expect(task.status.value).toBe(StatusType.Pending);
        const events = task.getUncommittedEvents();
        expect((events[0] as TaskReturnedToPendingEvent).name).toBe('task.returned_to_pending');
      });

      it('rejects returning to pending from any state other than In Progress', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(() => task.returnToPending()).toThrow(TaskCannotReturnToPendingError);
      });
    });

    describe('reopen()', () => {
      it('should reopen a completed task (Completed -> Pending) and always emit TaskReopenedEvent', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        task.clearUncommittedEvents();

        task.reopen(true);

        expect(task.status.value).toBe(StatusType.Pending);
        expect(task.completedAt).toBeNull();
        const events = task.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]?.name).toBe('task.reopened');
      });

      it('should reopen a cancelled task (Cancelled -> Pending), same event as reopening a Completed one', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.cancel();
        task.clearUncommittedEvents();

        task.reopen(true);

        expect(task.status.value).toBe(StatusType.Pending);
        const events = task.getUncommittedEvents();
        expect(events[0]?.name).toBe('task.reopened');
      });

      it('never lands on In Progress, even if the task was In Progress before completing', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        task.complete();
        task.reopen(true);
        expect(task.status.value).toBe(StatusType.Pending);
      });

      it('should not reopen a pending task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        expect(() => task.reopen(true)).toThrow(TaskCannotBeReopenedError);
      });

      it('should not reopen a Blocked task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('manual');
        expect(() => task.reopen(true)).toThrow(TaskCannotBeReopenedError);
      });

      it('REJECTS reopening when the linked Commitment no longer allows it (ADR-022 §6.2)', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();

        expect(() => task.reopen(false)).toThrow(TaskReopenBlockedByCommitmentError);
        expect(task.status.value).toBe(StatusType.Completed); // unchanged
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

      it('is available while In Progress', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.start();
        expect(() => task.edit(new TaskTitle('New title'))).not.toThrow();
      });

      it('is available while Blocked', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.block('manual');
        expect(() => task.edit(new TaskTitle('New title'))).not.toThrow();
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

      it('should not edit a Completed task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(() => task.edit(new TaskTitle('Anything'))).toThrow(TaskCannotBeCompletedError);
      });

      it('should not edit a Cancelled task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.cancel();
        expect(() => task.edit(new TaskTitle('Anything'))).toThrow(TaskCannotBeCancelledError);
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

      it('blocks relinkGoal on a Cancelled task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.cancel();
        expect(() => task.relinkGoal(goalId, new Date())).toThrow(TaskCannotBeCancelledError);
      });

      it('blocks relinkCommitment on a deleted task', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.delete();
        expect(() => task.relinkCommitment(commitmentId, new Date())).toThrow(TaskAlreadyDeletedError);
      });
    });

    describe('ADR-022 §4.3 — exhaustive transition table', () => {
      function freshTask(id = validId): Task {
        return Task.register(id, validIdentityId, validTitle, null, validPriority);
      }

      it('Pending -> In Progress (Start)', () => {
        const t = freshTask();
        t.start();
        expect(t.status.value).toBe(StatusType.InProgress);
      });

      it('Pending -> Completed (Complete, skipping In Progress)', () => {
        const t = freshTask();
        t.complete();
        expect(t.status.value).toBe(StatusType.Completed);
      });

      it('Pending -> Blocked (Block)', () => {
        const t = freshTask();
        t.block('manual');
        expect(t.status.value).toBe(StatusType.Blocked);
      });

      it('Pending -> Cancelled (Cancel)', () => {
        const t = freshTask();
        t.cancel();
        expect(t.status.value).toBe(StatusType.Cancelled);
      });

      it('In Progress -> Completed (Complete)', () => {
        const t = freshTask();
        t.start();
        t.complete();
        expect(t.status.value).toBe(StatusType.Completed);
      });

      it('In Progress -> Blocked (Block)', () => {
        const t = freshTask();
        t.start();
        t.block('dependency');
        expect(t.status.value).toBe(StatusType.Blocked);
      });

      it('In Progress -> Cancelled (Cancel)', () => {
        const t = freshTask();
        t.start();
        t.cancel();
        expect(t.status.value).toBe(StatusType.Cancelled);
      });

      it('In Progress -> Pending (Return to Pending)', () => {
        const t = freshTask();
        t.start();
        t.returnToPending();
        expect(t.status.value).toBe(StatusType.Pending);
      });

      it('Blocked -> Pending (manual Unblock, pre-block was Pending)', () => {
        const t = freshTask();
        t.block('manual');
        t.unblock('manual');
        expect(t.status.value).toBe(StatusType.Pending);
      });

      it('Blocked -> In Progress (manual Unblock, pre-block was In Progress)', () => {
        const t = freshTask();
        t.start();
        t.block('manual');
        t.unblock('manual');
        expect(t.status.value).toBe(StatusType.InProgress);
      });

      it('Blocked -> Pending (system Unblock, pre-block was Pending, blockedType dependency)', () => {
        const t = freshTask();
        t.block('dependency');
        t.unblock('system');
        expect(t.status.value).toBe(StatusType.Pending);
      });

      it('Blocked -> In Progress (system Unblock, pre-block was In Progress, blockedType dependency)', () => {
        const t = freshTask();
        t.start();
        t.block('dependency');
        t.unblock('system');
        expect(t.status.value).toBe(StatusType.InProgress);
      });

      it('Blocked -> Cancelled (Cancel)', () => {
        const t = freshTask();
        t.block('manual');
        t.cancel();
        expect(t.status.value).toBe(StatusType.Cancelled);
      });

      it('Completed -> Pending (Reopen, commitmentAllowsReopen=true)', () => {
        const t = freshTask();
        t.complete();
        t.reopen(true);
        expect(t.status.value).toBe(StatusType.Pending);
      });

      it('Cancelled -> Pending (Reopen, commitmentAllowsReopen=true)', () => {
        const t = freshTask();
        t.cancel();
        t.reopen(true);
        expect(t.status.value).toBe(StatusType.Pending);
      });

      it('no transition ever lands automatically on In Progress', () => {
        // Every path that reaches Pending or Completed/Cancelled requires an
        // explicit action; only Start (from Pending) reaches In Progress.
        const t = freshTask();
        t.complete();
        t.reopen(true);
        expect(t.status.value).toBe(StatusType.Pending);
        expect(t.status.value).not.toBe(StatusType.InProgress);
      });
    });

    describe('Event Sourcing (loadFromHistory)', () => {
      it('should rehydrate task from event stream through the new lifecycle', () => {
        const task = Task.register(validId, validIdentityId, validTitle, validDescription, validPriority, 30);
        task.changePriority(TaskPriority.high());
        task.start();
        task.block('manual', 'blocked for testing');
        task.unblock('manual');
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
        expect(rehydrated.blockedType).toBeNull();
      });

      it('should maintain correct version after replaying history', () => {
        const task = Task.register(validId, validIdentityId, validTitle, null, validPriority);
        task.complete();
        expect(task.version).toBe(2); // registered + completed
      });
    });
  });
});
