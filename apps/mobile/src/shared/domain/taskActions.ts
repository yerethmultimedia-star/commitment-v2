import type { TaskStatus, TaskBlockedType } from '@/features/tasks/models/task.model';

export type TaskAction =
  | 'start'
  | 'complete'
  | 'block'
  | 'unblock'
  | 'returnToPending'
  | 'cancel'
  | 'reopen';

export interface TaskActionConfig {
  id: TaskAction;
  /** i18n key inside the 'tasks' namespace */
  labelKey: string;
  /** Tamagui theme/variant */
  variant: 'primary' | 'secondary' | 'destructive';
  /** Whether to prompt a confirmation dialog before executing */
  requiresConfirmation: boolean;
  /** Whether the action is potentially irreversible */
  destructive: boolean;
}

const ACTION_CONFIG: Record<TaskAction, TaskActionConfig> = {
  start: {
    id: 'start',
    labelKey: 'actions.start',
    variant: 'primary',
    requiresConfirmation: false,
    destructive: false,
  },
  complete: {
    id: 'complete',
    labelKey: 'actions.complete',
    variant: 'primary',
    requiresConfirmation: false,
    destructive: false,
  },
  block: {
    id: 'block',
    labelKey: 'actions.block',
    variant: 'secondary',
    requiresConfirmation: false,
    destructive: false,
  },
  unblock: {
    id: 'unblock',
    labelKey: 'actions.unblock',
    variant: 'secondary',
    requiresConfirmation: false,
    destructive: false,
  },
  returnToPending: {
    id: 'returnToPending',
    labelKey: 'actions.returnToPending',
    variant: 'secondary',
    requiresConfirmation: false,
    destructive: false,
  },
  cancel: {
    id: 'cancel',
    labelKey: 'actions.cancel',
    variant: 'destructive',
    requiresConfirmation: true,
    destructive: true,
  },
  reopen: {
    id: 'reopen',
    labelKey: 'actions.reopen',
    variant: 'primary',
    requiresConfirmation: false,
    destructive: false,
  },
};

/**
 * Returns the allowed transitions from a given task status (ADR-022 §4.2).
 * The UI must NEVER contain status conditionals; always call this function —
 * same rule as commitmentActions.ts's getAllowedActions().
 *
 * `unblock` is additionally filtered out when `blockedType === 'dependency'`
 * — that kind of block can only resolve automatically, when the blocking
 * predecessor Task completes (ADR-022 §4.2/§5); offering a manual Unblock
 * button for it would just produce a guaranteed 409.
 */
const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskAction[]> = {
  pending: ['start', 'complete', 'block', 'cancel'],
  in_progress: ['complete', 'block', 'returnToPending', 'cancel'],
  blocked: ['unblock', 'cancel'],
  completed: ['reopen'],
  cancelled: ['reopen'],
};

export function getAllowedTaskActions(
  status: TaskStatus,
  blockedType?: TaskBlockedType | null,
): TaskActionConfig[] {
  const ids = ALLOWED_TRANSITIONS[status];
  const visible =
    status === 'blocked' && blockedType === 'dependency'
      ? ids.filter((id) => id !== 'unblock')
      : ids;
  return visible.map((id) => ACTION_CONFIG[id]);
}

// ─── Editable state ─────────────────────────────────────────────────────────

/**
 * Editable from any operational state (Pending/In Progress/Blocked), never
 * Completed/Cancelled — ADR-022 §4.2, "Disponibilidad de Edit — RESUELTO".
 * The UI must NEVER contain status conditionals; always call this function.
 */
const EDITABLE_STATUSES: readonly TaskStatus[] = ['pending', 'in_progress', 'blocked'];

export function isTaskEditable(status: TaskStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}
