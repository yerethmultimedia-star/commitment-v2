import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';
import { Title, Body, Button } from '@commitment/design-system';

export default function NotFoundScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$3" backgroundColor="$background">
        <Title i18nKey="notFound.description" fontSize="$5" fontWeight="bold" textAlign="center" />
        <Button i18nKey="notFound.link" onPress={() => router.replace('/')} />
      </YStack>
    </>
  );
}
