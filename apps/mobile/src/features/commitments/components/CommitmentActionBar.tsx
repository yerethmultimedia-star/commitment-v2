import { YStack, Text, Button, XStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import type { ActionConfig } from '@/shared/domain/commitmentActions';

interface Props {
  actions: ActionConfig[];
  onAction: (action: ActionConfig) => void;
  pendingAction?: string | null;
}

export function CommitmentActionBar({ actions, onAction, pendingAction }: Props) {
  const { t } = useTranslation();

  if (actions.length === 0) return null;

  const primaryActions = actions.filter((a) => a.variant !== 'destructive');
  const destructiveActions = actions.filter((a) => a.variant === 'destructive');

  const getTheme = (action: ActionConfig) => {
    if (action.variant === 'destructive') return 'red';
    if (action.variant === 'primary') return 'active';
    return undefined;
  };

  return (
    <YStack gap="$3">
      {primaryActions.length > 0 && (
        <XStack gap="$3" flexWrap="wrap">
          {primaryActions.map((action) => (
            <Button
              key={action.id}
              flex={1}
              size="$4"
              theme={getTheme(action)}
              disabled={pendingAction != null}
              opacity={pendingAction === action.id ? 0.6 : 1}
              onPress={() => onAction(action)}
              accessibilityRole="button"
              accessibilityLabel={t(action.labelKey, { ns: 'commitments' })}
              accessibilityState={{ disabled: pendingAction != null }}
            >
              <Text fontWeight="bold">
                {pendingAction === action.id
                  ? '...'
                  : t(action.labelKey, { ns: 'commitments' })}
              </Text>
            </Button>
          ))}
        </XStack>
      )}

      {destructiveActions.map((action) => (
        <Button
          key={action.id}
          theme="red"
          variant="outlined"
          size="$4"
          disabled={pendingAction != null}
          onPress={() => onAction(action)}
          accessibilityRole="button"
          accessibilityLabel={t(action.labelKey, { ns: 'commitments' })}
          accessibilityState={{ disabled: pendingAction != null }}
        >
          <Text color="$red10" fontWeight="bold">
            {t(action.labelKey, { ns: 'commitments' })}
          </Text>
        </Button>
      ))}
    </YStack>
  );
}
