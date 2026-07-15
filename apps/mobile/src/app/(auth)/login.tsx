import { YStack, Text, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/auth/use-auth';
import { FullScreenCenter } from '@/components/FullScreenCenter';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();

  return (
    <FullScreenCenter>
      <YStack gap="$4" alignItems="center">
        <Text fontSize="$9" fontWeight="bold" color="$accent">
          {t('login.title', { ns: 'auth' })}
        </Text>
        <Text fontSize="$5" color="$contentSecondary">
          {t('login.subtitle', { ns: 'auth' })}
        </Text>
        
        <Button size="$5" theme="active" onPress={login} marginTop="$8">
          {t('login.continue', { ns: 'auth' })}
        </Button>
      </YStack>
    </FullScreenCenter>
  );
}
