import { YStack } from 'tamagui';
import { Title, Body, Button } from '@commitment/design-system';
import { useAuth } from '@/core/auth/use-auth';
import { FullScreenCenter } from '@/components/FullScreenCenter';

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <FullScreenCenter>
      <YStack gap="$4" alignItems="center">
        <Title fontSize="$9" fontWeight="bold" color="$accent" i18nKey="auth:login.title" />
        <Body fontSize="$5" color="$contentSecondary" i18nKey="auth:login.subtitle" />

        <YStack marginTop="$8">
          <Button variant="primary" size="large" onPress={login} i18nKey="auth:login.continue" />
        </YStack>
      </YStack>
    </FullScreenCenter>
  );
}
