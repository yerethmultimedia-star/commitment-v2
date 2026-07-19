import { TaskId } from '../value-objects/task-id.js';
import { TaskDependency } from '../aggregate/task-dependency.js';
import { TaskDependencyService } from '../services/task-dependency.service.js';
import { InvalidTaskDependencyError } from '../errors/task-errors.js';

describe('TaskDependency (ADR-022 §5)', () => {
  const taskA = new TaskId('018f6b5c-0005-7000-8000-aaaaaaaaaaaa');
  const taskB = new TaskId('018f6b5c-0005-7000-8000-bbbbbbbbbbbb');
  const taskC = new TaskId('018f6b5c-0005-7000-8000-cccccccccccc');

  describe('TaskDependency.create()', () => {
    it('creates a relationship entity with exactly the V1 fields — no more', () => {
      const createdAt = new Date('2026-07-18T00:00:00.000Z');
      const dep = TaskDependency.create('dep-1', taskA, taskB, createdAt);

      expect(dep.id).toBe('dep-1');
      expect(dep.predecessorTaskId.equals(taskA)).toBe(true);
      expect(dep.successorTaskId.equals(taskB)).toBe(true);
      expect(dep.createdAt).toBe(createdAt);
    });

    it('rejects a task depending on itself', () => {
      expect(() => TaskDependency.create('dep-1', taskA, taskA)).toThrow(InvalidTaskDependencyError);
    });
  });

  describe('TaskDependencyService.wouldCreateCycle()', () => {
    it('returns false for a fresh graph with no existing dependencies', () => {
      expect(TaskDependencyService.wouldCreateCycle([], taskA, taskB)).toBe(false);
    });

    it('returns true for a direct self-dependency', () => {
      expect(TaskDependencyService.wouldCreateCycle([], taskA, taskA)).toBe(true);
    });

    it('returns true for a direct 2-node cycle (A->B already exists, proposing B->A)', () => {
      const existing = [TaskDependency.create('dep-1', taskA, taskB)];
      expect(TaskDependencyService.wouldCreateCycle(existing, taskB, taskA)).toBe(true);
    });

    it('returns true for a transitive 3-node cycle (A before B before C exists, proposing C before A)', () => {
      // dep-1: A must complete before B. dep-2: B must complete before C.
      // Proposing "C before A" would close the loop A->B->C->A.
      const existing = [
        TaskDependency.create('dep-1', taskA, taskB),
        TaskDependency.create('dep-2', taskB, taskC),
      ];
      expect(TaskDependencyService.wouldCreateCycle(existing, taskC, taskA)).toBe(true);
    });

    it('allows a diamond shape (A->B, A->C, B->D, C->D) — not a cycle', () => {
      const taskD = new TaskId('018f6b5c-0005-7000-8000-dddddddddddd');
      const existing = [
        TaskDependency.create('dep-1', taskA, taskB),
        TaskDependency.create('dep-2', taskA, taskC),
        TaskDependency.create('dep-3', taskB, taskD),
      ];
      expect(TaskDependencyService.wouldCreateCycle(existing, taskC, taskD)).toBe(false);
    });

    it('allows unrelated dependencies in the same graph', () => {
      const taskD = new TaskId('018f6b5c-0005-7000-8000-dddddddddddd');
      const existing = [TaskDependency.create('dep-1', taskA, taskB)];
      expect(TaskDependencyService.wouldCreateCycle(existing, taskC, taskD)).toBe(false);
    });
  });
});
