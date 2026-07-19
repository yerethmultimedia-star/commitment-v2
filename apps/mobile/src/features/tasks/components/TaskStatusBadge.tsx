import type { ReactNode } from 'react';
import { Circle, PlayCircle, Ban, CheckCircle2, XCircle } from '@tamagui/lucide-icons';
import { Badge, BadgeTone } from '@commitment/design-system';
import { TaskModel } from '../models/task.model';

interface Props {
  status: TaskModel['status'];
}

// V-001 (TECH_DEBT.md Item 38, status sub-case): informational only — never
// the control used to change state (that stays the explicit lifecycle
// buttons on TasksScreen). Icon + tone + text together, so the state never
// relies on color alone (WCAG). Mirrors CommitmentStatusBadge.tsx's
// domain-to-tone mapping convention; adds an icon on top since Commitment's
// own badge doesn't carry one yet.
//
// ADR-022 Task Lifecycle & Execution Model — the 5 official states
// (packages/domain/src/task/value-objects/task-status.ts). `Archived`
// removed (see TECH_DEBT.md Item 41 / this file's prior 3-state scope);
// `Deferred` was proposed pre-ADR-022 and never built. Tone mapping is
// local to Task, not cross-imported from Commitment's — same vocabulary,
// separate bounded contexts (TECH_DEBT.md Item 38's own resolution note).
const STATUS_TONE: Record<TaskModel['status'], BadgeTone> = {
  pending: 'neutral',
  in_progress: 'accent',
  blocked: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

const STATUS_ICON: Record<TaskModel['status'], ReactNode> = {
  pending: <Circle size={12} />,
  in_progress: <PlayCircle size={12} />,
  blocked: <Ban size={12} />,
  completed: <CheckCircle2 size={12} />,
  cancelled: <XCircle size={12} />,
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
