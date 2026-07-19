import { TaskId } from '../value-objects/task-id.js';
import { TaskDependency } from '../aggregate/task-dependency.js';

/**
 * Pure domain service (no I/O) — the caller (Application Layer) is
 * responsible for loading the relevant `TaskDependency` graph from the
 * repository first. This class only reasons about the graph it's handed.
 * ADR-022 §5: dependencies are exclusively Task -> Task; cycles (direct or
 * transitive) are prohibited.
 */
export class TaskDependencyService {
  /**
   * True if adding `predecessorTaskId -> successorTaskId` to `existing`
   * would create a cycle — i.e. `successorTaskId` can already reach
   * `predecessorTaskId` through the existing graph.
   */
  public static wouldCreateCycle(
    existing: readonly TaskDependency[],
    predecessorTaskId: TaskId,
    successorTaskId: TaskId
  ): boolean {
    if (predecessorTaskId.value === successorTaskId.value) {
      return true;
    }

    const adjacency = new Map<string, string[]>();
    for (const dep of existing) {
      const from = dep.predecessorTaskId.value;
      const to = dep.successorTaskId.value;
      const list = adjacency.get(from) ?? [];
      list.push(to);
      adjacency.set(from, list);
    }

    // Reachability search from the proposed successor: if it can already
    // reach the proposed predecessor, the new edge would close a cycle.
    const visited = new Set<string>();
    const stack: string[] = [successorTaskId.value];

    while (stack.length > 0) {
      const current = stack.pop() as string;
      if (current === predecessorTaskId.value) {
        return true;
      }
      if (visited.has(current)) continue;
      visited.add(current);
      const neighbors = adjacency.get(current) ?? [];
      stack.push(...neighbors);
    }

    return false;
  }
}
