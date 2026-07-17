import { YStack, XStack } from 'tamagui';
import { Button } from '@commitment/design-system';
import type { ActionConfig } from '@/shared/domain/commitmentActions';

interface Props {
  actions: ActionConfig[];
  onAction: (action: ActionConfig) => void;
  pendingAction?: string | null;
}

export function CommitmentActionBar({ actions, onAction, pendingAction }: Props) {
  if (actions.length === 0) return null;

  const primaryActions = actions.filter((a) => a.variant !== 'destructive');
  const destructiveActions = actions.filter((a) => a.variant === 'destructive');

  return (
    <YStack gap="$3">
      {primaryActions.length > 0 && (
        <XStack gap="$3" flexWrap="wrap">
          {primaryActions.map((action) => (
            <YStack key={action.id} flex={1}>
              <Button
                variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                disabled={pendingAction != null}
                loading={pendingAction === action.id}
                fullWidth
                onPress={() => onAction(action)}
                i18nKey={`commitments:${action.labelKey}`}
              />
            </YStack>
          ))}
        </XStack>
      )}

      {destructiveActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          destructive
          disabled={pendingAction != null}
          loading={pendingAction === action.id}
          onPress={() => onAction(action)}
          i18nKey={`commitments:${action.labelKey}`}
        />
      ))}
    </YStack>
  );
}
