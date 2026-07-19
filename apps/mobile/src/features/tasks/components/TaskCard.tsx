import { XStack, YStack } from 'tamagui';
import { Card, Body, Badge, BadgeTone, Button } from '@commitment/design-system';
import { TaskModel } from '../models/task.model';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskActionBar } from './TaskActionBar';
import { getAllowedTaskActions, isTaskEditable, type TaskActionConfig } from '@/shared/domain/taskActions';

// Same three levels, same meaning, same tone mapping as Commitment's priority
// (see CommitmentPriorityBadge.tsx) — TECH_DEBT.md Item 38 (V-001).
const PRIORITY_TONE: Record<TaskModel['priority'], BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

interface Props {
  task: TaskModel;
  pendingAction?: string | null;
  onAction: (task: TaskModel, action: TaskActionConfig) => void;
  onEdit: (task: TaskModel) => void;
  onDuplicate: (task: TaskModel) => void;
}

export function TaskCard({ task, pendingAction, onAction, onEdit, onDuplicate }: Props) {
  // ADR-022 §4.2 — the UI must never contain status conditionals of its own;
  // always call getAllowedTaskActions()/isTaskEditable() (same rule as
  // commitmentActions.ts).
  const allowedActions = getAllowedTaskActions(task.status, task.blockedType);
  const editable = isTaskEditable(task.status);

  return (
    <Card variant="elevated" gap="$2" opacity={task.status === 'completed' || task.status === 'cancelled' ? 0.6 : 1}>
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap="$1">
          <Body fontWeight="700" fontSize="$5">{task.title}</Body>
          {!!task.description && (
            <Body tone="secondary" fontSize="$3">{task.description}</Body>
          )}
          {task.status === 'blocked' && !!task.blockedReason && (
            <Body tone="secondary" fontSize="$3" fontStyle="italic">{task.blockedReason}</Body>
          )}
        </YStack>
        <Badge
          tone={PRIORITY_TONE[task.priority]}
          i18nKey={`tasks:form.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`}
        />
      </XStack>

      <XStack justifyContent="space-between" alignItems="center" marginTop="$1">
        <TaskStatusBadge status={task.status} />

        <XStack gap="$2">
          {editable && (
            <Button
              size="small"
              variant="ghost"
              i18nKey="tasks:actions.edit"
              onPress={() => onEdit(task)}
            />
          )}
          <Button
            size="small"
            variant="ghost"
            i18nKey="tasks:actions.duplicate"
            onPress={() => onDuplicate(task)}
          />
        </XStack>
      </XStack>

      <TaskActionBar
        actions={allowedActions}
        pendingAction={pendingAction}
        onAction={(action) => onAction(task, action)}
      />
    </Card>
  );
}
