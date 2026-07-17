import { YStack } from 'tamagui';
import { Title, Body } from '@commitment/design-system';

interface EmptyStateProps {
  /** @deprecated pass titleI18nKey instead so the Feature doesn't call t() itself. */
  title?: string;
  /** @deprecated pass descriptionI18nKey instead. */
  description?: string;
  titleI18nKey?: string;
  descriptionI18nKey?: string;
}

export function EmptyState({ title, description, titleI18nKey, descriptionI18nKey }: EmptyStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
      {titleI18nKey ? (
        <Title fontSize="$6" fontWeight="bold" textAlign="center" i18nKey={titleI18nKey} />
      ) : (
        <Title fontSize="$6" fontWeight="bold" textAlign="center">
          {title}
        </Title>
      )}
      {descriptionI18nKey ? (
        <Body tone="secondary" fontSize="$4" textAlign="center" i18nKey={descriptionI18nKey} />
      ) : (
        <Body tone="secondary" fontSize="$4" textAlign="center">
          {description}
        </Body>
      )}
    </YStack>
  );
}
