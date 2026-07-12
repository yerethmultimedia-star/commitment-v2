import { YStack, Text, Button, XStack, Circle } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/auth/use-auth';
import { useSession } from '@/core/auth/use-session';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Card } from '@commitment/design-system';

export default function ProfileScreen() {
  const { t } = useTranslation('common');
  const { logout } = useAuth();
  const { identityId } = useSession();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyId = async () => {
    if (identityId) {
      await Clipboard.setStringAsync(identityId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingHorizontal="$4" paddingVertical="$6" gap="$4">
      {/* Premium User Profile Header */}
      <XStack gap="$3" alignItems="center" marginBottom="$2" padding="$2">
        <Circle size={60} backgroundColor="$accent" borderWidth={1} borderColor="$borderColor" elevation={2}>
          <Text fontSize="$6" fontWeight="bold" color="white">ME</Text>
        </Circle>
        <YStack flex={1} gap="$1">
          <Text fontSize="$6" fontWeight="bold" color="$text">
            {t('profile.title')}
          </Text>
          <Text fontSize="$3" color="$textSecondary">
            {t('profile.subtitle')}
          </Text>
        </YStack>
      </XStack>

      {/* Identity ID section */}
      <Card variant="elevated" gap="$2">
        <Text fontSize="$4" color="$textSecondary" fontWeight="bold">
          {t('profile.identityId')}
        </Text>
        <XStack alignItems="center" justifyContent="space-between" gap="$2">
          <Text fontSize="$3" color="$text" numberOfLines={1} flex={1} marginRight="$2" fontFamily="$mono">
            {identityId}
          </Text>
          <Button size="$3" onPress={handleCopyId}>
            {copied ? t('profile.copied') : t('profile.copy')}
          </Button>
        </XStack>
      </Card>

      {/* App details */}
      <Card variant="elevated" gap="$2">
        <XStack justifyContent="space-between" paddingVertical="$1">
          <Text fontSize="$4" color="$textSecondary">{t('profile.version')}</Text>
          <Text fontSize="$4" fontWeight="500">{Constants.expoConfig?.version || '1.0.0'}</Text>
        </XStack>
        <XStack justifyContent="space-between" paddingVertical="$1">
          <Text fontSize="$4" color="$textSecondary">{t('profile.environment')}</Text>
          <Text fontSize="$4" fontWeight="500" textTransform="capitalize">{process.env.NODE_ENV}</Text>
        </XStack>
      </Card>

      {/* Settings actions */}
      <Card variant="elevated" padding={0} overflow="hidden">
        <Button 
          size="$4" 
          chromeless
          justifyContent="flex-start"
          onPress={() => router.push('/(settings)/appearance' as any)}
          paddingHorizontal="$4"
          borderRadius={0}
        >
          <Text fontSize="$4" fontWeight="500" color="$text">
            {t('profile.appearance')}
          </Text>
        </Button>
      </Card>

      {/* Logout button */}
      <YStack marginTop="auto" paddingVertical="$2">
        <Button size="$5" theme="active" backgroundColor="$red10" color="white" onPress={logout}>
          <Text color="white" fontWeight="bold">
            {t('profile.logout')}
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}
