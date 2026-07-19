import { useState } from 'react';
import { useTaskActions } from './useTasks';
import type { TaskModel } from '../models/task.model';
import type { TaskActionConfig } from '@/shared/domain/taskActions';

/**
 * ADR-022 §4 lifecycle actions — the single dispatch table + confirmation +
 * pending-state machinery shared by any screen that renders TaskCard
 * (TasksScreen, GoalWorkspaceScreen's Tasks tab). Extracted so this isn't
 * duplicated per screen (UX reuse mandate, ADR-022 §9) — mirrors
 * useCommitmentActions()'s apiCallFor shape, generalized to work across
 * many tasks at once rather than one fixed id.
 */
export function useTaskActionDispatch() {
  const { start, complete, block, unblock, returnToPending, cancel, reopen, duplicate } = useTaskActions();
  const [confirming, setConfirming] = useState<{ task: TaskModel; action: TaskActionConfig } | null>(null);
  const [pending, setPending] = useState<{ taskId: string; actionId: string } | null>(null);

  const mutationFor: Record<TaskActionConfig['id'], (task: TaskModel) => void> = {
    start: (task) => start.mutate(task.id, { onSettled: () => setPending(null) }),
    complete: (task) => complete.mutate(task.id, { onSettled: () => setPending(null) }),
    block: (task) => block.mutate({ id: task.id }, { onSettled: () => setPending(null) }),
    unblock: (task) => unblock.mutate(task.id, { onSettled: () => setPending(null) }),
    returnToPending: (task) => returnToPending.mutate(task.id, { onSettled: () => setPending(null) }),
    cancel: (task) => cancel.mutate(task.id, { onSettled: () => setPending(null) }),
    reopen: (task) => reopen.mutate(task.id, { onSettled: () => setPending(null) }),
  };

  const executeAction = (task: TaskModel, action: TaskActionConfig) => {
    setConfirming(null);
    setPending({ taskId: task.id, actionId: action.id });
    mutationFor[action.id](task);
  };

  const handleAction = (task: TaskModel, action: TaskActionConfig) => {
    if (action.requiresConfirmation) {
      setConfirming({ task, action });
      return;
    }
    executeAction(task, action);
  };

  const pendingActionFor = (taskId: string) => (pending?.taskId === taskId ? pending.actionId : null);

  return { confirming, setConfirming, handleAction, executeAction, pendingActionFor, duplicate };
}
