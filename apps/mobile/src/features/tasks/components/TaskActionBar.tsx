import { YStack, XStack } from 'tamagui';
import { Button } from '@commitment/design-system';
import type { TaskActionConfig } from '@/shared/domain/taskActions';

interface Props {
  actions: TaskActionConfig[];
  onAction: (action: TaskActionConfig) => void;
  pendingAction?: string | null;
}

// Mirrors CommitmentActionBar.tsx's shape — same interaction pattern
// (primary actions wrap in a row, destructive actions get their own
// full-width row), kept local to Task rather than shared, consistent with
// Commitment/Task being separate bounded contexts that share vocabulary,
// not a shared component (TECH_DEBT.md Item 38's resolution note).
export function TaskActionBar({ actions, onAction, pendingAction }: Props) {
  if (actions.length === 0) return null;

  const primaryActions = actions.filter((a) => a.variant !== 'destructive');
  const destructiveActions = actions.filter((a) => a.variant === 'destructive');

  return (
    <YStack gap="$2">
      {primaryActions.length > 0 && (
        <XStack gap="$2" flexWrap="wrap">
          {primaryActions.map((action) => (
            <Button
              key={action.id}
              size="small"
              variant={action.variant === 'primary' ? 'primary' : 'secondary'}
              disabled={pendingAction != null}
              loading={pendingAction === action.id}
              onPress={() => onAction(action)}
              i18nKey={`tasks:${action.labelKey}`}
            />
          ))}
        </XStack>
      )}

      {destructiveActions.map((action) => (
        <Button
          key={action.id}
          size="small"
          variant="outline"
          destructive
          disabled={pendingAction != null}
          loading={pendingAction === action.id}
          onPress={() => onAction(action)}
          i18nKey={`tasks:${action.labelKey}`}
        />
      ))}
    </YStack>
  );
}
