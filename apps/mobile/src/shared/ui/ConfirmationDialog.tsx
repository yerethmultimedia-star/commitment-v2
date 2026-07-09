import { YStack, XStack, Text, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmationDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.5)"
      justifyContent="center"
      alignItems="center"
      zIndex={1000}
      paddingHorizontal="$6"
    >
      <YStack
        backgroundColor="$background"
        borderRadius="$5"
        padding="$5"
        gap="$4"
        width="100%"
        elevation="$4"
      >
        <Text fontSize="$6" fontWeight="bold" color="$text" textAlign="center">
          {title}
        </Text>
        <Text fontSize="$4" color="$textSecondary" textAlign="center">
          {description}
        </Text>
        <XStack gap="$3">
          <Button
            flex={1}
            variant="outlined"
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            {cancelLabel}
          </Button>
          <Button
            flex={1}
            theme={destructive ? 'red' : 'active'}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
          >
            <Text color="white" fontWeight="bold">
              {confirmLabel}
            </Text>
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
}
