import { YStack, Text, Button, XStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/auth/use-auth';
import { useSession } from '@/core/auth/use-session';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { identityId } = useSession();
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (identityId) {
      await Clipboard.setStringAsync(identityId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingHorizontal="$4" paddingVertical="$6" gap="$6">
      
      <YStack gap="$2" padding="$4" backgroundColor="$backgroundElement" borderRadius="$4">
        <Text fontSize="$4" color="$textSecondary" fontWeight="bold">
          {t('profile.identityId', { ns: 'common' })}
        </Text>
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$5" color="$text" numberOfLines={1} flex={1} marginRight="$2">
            {identityId}
          </Text>
          <Button size="$3" onPress={handleCopyId}>
            {copied ? t('profile.copied', { ns: 'common' }) : 'Copiar'}
          </Button>
        </XStack>
      </YStack>

      <YStack gap="$2" padding="$4" backgroundColor="$backgroundElement" borderRadius="$4">
        <XStack justifyContent="space-between">
          <Text fontSize="$4" color="$textSecondary">{t('profile.version', { ns: 'common' })}</Text>
          <Text fontSize="$4">{Constants.expoConfig?.version || '1.0.0'}</Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text fontSize="$4" color="$textSecondary">{t('profile.environment', { ns: 'common' })}</Text>
          <Text fontSize="$4">{process.env.NODE_ENV}</Text>
        </XStack>
      </YStack>

      <YStack marginTop="auto">
        <Button size="$5" theme="active" backgroundColor="$red10" color="white" onPress={logout}>
          {t('profile.logout', { ns: 'common' })}
        </Button>
      </YStack>

    </YStack>
  );
}
