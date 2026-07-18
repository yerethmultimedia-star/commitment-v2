import type { ReactNode } from 'react';
import { Circle, CheckCircle2, Archive } from '@tamagui/lucide-icons';
import { Badge, BadgeTone } from '@commitment/design-system';
import { TaskModel } from '../models/task.model';

interface Props {
  status: TaskModel['status'];
}

// V-001 (TECH_DEBT.md Item 38, status sub-case): informational only — never
// the control used to change state (that stays the explicit "Complete"/
// "Archive" buttons already on TasksScreen). Icon + tone + text together, so
// the state never relies on color alone (WCAG). Mirrors
// CommitmentStatusBadge.tsx's domain-to-tone mapping convention; adds an
// icon on top since Commitment's own badge doesn't carry one yet.
//
// Scope closed here: represents the 3 states the Task domain aggregate
// actually supports today (pending/completed/archived — see
// packages/domain/src/task/value-objects/task-status.ts). Pending/In
// Progress/Blocked/Deferred/Cancelled/Completed was the originally proposed
// state set, but states/transitions/events/invariants for it were never
// defined — that's domain design work, not a badge-rendering task. Tracked
// separately as "Task Lifecycle Expansion," a distinct future initiative
// (its own ADR), not an extension of this component.
const STATUS_TONE: Record<TaskModel['status'], BadgeTone> = {
  pending: 'neutral',
  completed: 'success',
  archived: 'warning',
};

const STATUS_ICON: Record<TaskModel['status'], ReactNode> = {
  pending: <Circle size={12} />,
  completed: <CheckCircle2 size={12} />,
  archived: <Archive size={12} />,
};

export function TaskStatusBadge({ status }: Props) {
  return (
    <Badge
      tone={STATUS_TONE[status]}
      iconStart={STATUS_ICON[status]}
      i18nKey={`tasks:status.${status}`}
    />
  );
}
