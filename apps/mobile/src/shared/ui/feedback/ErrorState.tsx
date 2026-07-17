import { YStack, Button as TamaguiButton, Text as TamaguiText } from 'tamagui';
import { Body, Button } from '@commitment/design-system';

interface ErrorStateProps {
  /** @deprecated pass messageI18nKey instead so the Feature doesn't call t() itself. */
  message?: string;
  onRetry: () => void;
  /**
   * @deprecated pass retryLabelI18nKey instead. Kept for old callers only —
   * the design-system Button requires a real i18nKey and can't render an
   * arbitrary pre-translated string, so this path renders a bare Tamagui
   * Button rather than force every caller to add a translation key today.
   */
  retryLabel?: string;
  messageI18nKey?: string;
  retryLabelI18nKey?: string;
}

export function ErrorState({ message, onRetry, retryLabel, messageI18nKey, retryLabelI18nKey }: ErrorStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
      {messageI18nKey ? (
        <Body fontSize="$5" color="$danger" textAlign="center" i18nKey={messageI18nKey} />
      ) : (
        <Body fontSize="$5" color="$danger" textAlign="center">
          {message}
        </Body>
      )}
      {retryLabelI18nKey ? (
        <Button variant="primary" onPress={onRetry} i18nKey={retryLabelI18nKey} />
      ) : (
        <TamaguiButton theme="active" onPress={onRetry}>
          <TamaguiText>{retryLabel}</TamaguiText>
        </TamaguiButton>
      )}
    </YStack>
  );
}
