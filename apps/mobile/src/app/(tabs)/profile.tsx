import { YStack, Text, Button, XStack, Circle, Switch } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Settings, Bell, SlidersHorizontal, ChevronRight } from '@tamagui/lucide-icons';
import { useAuth } from '@/core/auth/use-auth';
import { useSession } from '@/core/auth/use-session';
import { formatDate } from '@commitment/localization';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Card, Title, Body, IconButton } from '@commitment/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useDemoModeStore } from '@/core/demo/demo-mode.store';
import { useTabBarHeightStore } from '@/shared/store/use-tab-bar-height-store';
import { demoUser } from '@/core/demo/demo-data';
import { registerForPushNotifications } from '@/core/notifications/push-registration';

export default function ProfileScreen() {
  const { t } = useTranslation('common');
  const { logout } = useAuth();
  const tabBarInset = useTabBarHeightStore((s) => s.reservedHeight);
  const { identityId } = useSession();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode);

  const handleToggleDemoMode = (checked: boolean) => {
    useDemoModeStore.getState().setDemoMode(checked);
    // Data source just changed underneath the same query keys — the cached
    // results from the other source are now wrong, not just stale.
    queryClient.invalidateQueries({ queryKey: ['commitments'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleCopyId = async () => {
    if (identityId) {
      await Clipboard.setStringAsync(identityId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestNotifications = () => {
    if (identityId) registerForPushNotifications(identityId);
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingHorizontal="$4" paddingTop="$6" paddingBottom={24 + tabBarInset} gap="$4">
      {/* Header: title + settings gear */}
      <XStack justifyContent="space-between" alignItems="center">
        <Title i18nKey="profile.header.title" fontSize="$6" fontWeight="bold" />
        <IconButton
          iconToken={<Settings size={20} color="$contentSecondary" />}
          tooltipI18nKey="settings.title"
          onPress={() => router.push('/(settings)' as any)}
        />
      </XStack>

      {/* Identity row: avatar, name, plan badge, email, member since — real demo user data */}
      <XStack gap="$3" alignItems="center">
        <Circle size={60} backgroundColor="$accent" borderWidth={1} borderColor="$divider" elevation={2}>
          <Text fontSize="$6" fontWeight="bold" color="$contentOnAccent">{demoUser.avatarInitials}</Text>
        </Circle>
        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2">
            <Body fontSize="$5" fontWeight="700">{demoUser.name}</Body>
            <XStack backgroundColor="$accent" paddingHorizontal="$2" paddingVertical={2} borderRadius="$2">
              <Body fontSize="$1" fontWeight="700" color="$contentOnAccent">{demoUser.plan}</Body>
            </XStack>
          </XStack>
          <Body tone="secondary" fontSize="$3">{demoUser.email}</Body>
          <Body tone="secondary" fontSize="$2">
            {t('profile.memberSince', { date: formatDate(demoUser.memberSince, 'MMM yyyy') })}
          </Body>
        </YStack>
      </XStack>

      {/* MI PLAN */}
      <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
        {t('profile.plan.title')}
      </Body>
      <Card variant="elevated">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap="$1">
            <Body fontWeight="700" fontSize="$4">{t('profile.plan.planLabel', { plan: demoUser.plan })}</Body>
            <Body tone="secondary" fontSize="$2">
              {t('profile.plan.renewal', { date: formatDate(demoUser.planRenewalDate, 'd MMM yyyy') })}
            </Body>
          </YStack>
          {/* Plain text, not a button — no real billing/subscription management exists to link to. */}
          <Body color="$accent" fontWeight="600" fontSize="$3">{t('profile.plan.manage')}</Body>
        </XStack>
      </Card>

      {/* CUENTA — only rows with real destinations/behavior */}
      <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
        {t('profile.account.title')}
      </Body>
      <Card variant="elevated" padding={0} overflow="hidden">
        <XStack
          onPress={() => router.push('/(settings)' as any)}
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          gap="$3"
          pressStyle={{ opacity: 0.7 }}
          accessibilityRole="button"
          accessibilityLabel={t('profile.account.preferences')}
        >
          <SlidersHorizontal size={20} color="$contentSecondary" />
          <Body flex={1} fontSize="$4">{t('profile.account.preferences')}</Body>
          <ChevronRight size={18} color="$contentTertiary" />
        </XStack>
        <XStack
          onPress={handleRequestNotifications}
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          gap="$3"
          borderTopWidth={1}
          borderTopColor="$divider"
          pressStyle={{ opacity: 0.7 }}
          accessibilityRole="button"
          accessibilityLabel={t('profile.account.notifications')}
          accessibilityHint={t('profile.account.notificationsDescription')}
        >
          <Bell size={20} color="$contentSecondary" />
          <YStack flex={1}>
            <Body fontSize="$4">{t('profile.account.notifications')}</Body>
            <Body tone="secondary" fontSize="$2">{t('profile.account.notificationsDescription')}</Body>
          </YStack>
          <ChevronRight size={18} color="$contentTertiary" />
        </XStack>
      </Card>

      {/* Advanced / developer tools — kept from the previous screen, real and useful for demo/dev use, just less prominent than the new mockup-driven sections above. */}
      <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
        {t('profile.developer.title')}
      </Body>
      <Card variant="elevated" gap="$2">
        <Body fontSize="$4" tone="secondary" fontWeight="bold">
          {t('profile.identityId')}
        </Body>
        <XStack alignItems="center" justifyContent="space-between" gap="$2">
          <Text fontSize="$3" color="$contentPrimary" numberOfLines={1} flex={1} marginRight="$2" fontFamily="$mono">
            {identityId}
          </Text>
          <Button size="$3" onPress={handleCopyId}>
            {copied ? t('profile.copied') : t('profile.copy')}
          </Button>
        </XStack>
      </Card>

      <Card variant="elevated" gap="$2">
        <XStack justifyContent="space-between" paddingVertical="$1">
          <Body fontSize="$4" tone="secondary">{t('profile.version')}</Body>
          <Text fontSize="$4" fontWeight="500" color="$contentPrimary">{Constants.expoConfig?.version || '1.0.0'}</Text>
        </XStack>
        <XStack justifyContent="space-between" paddingVertical="$1">
          <Body fontSize="$4" tone="secondary">{t('profile.environment')}</Body>
          <Text fontSize="$4" fontWeight="500" textTransform="capitalize" color="$contentPrimary">{process.env.NODE_ENV}</Text>
        </XStack>
      </Card>

      <Card variant="elevated" gap="$2">
        <XStack alignItems="center" justifyContent="space-between" gap="$2">
          <YStack flex={1} paddingRight="$4">
            <Body fontSize="$4">{t('profile.developer.demoMode.label')}</Body>
            <Body fontSize="$2" tone="secondary" marginTop="$1">
              {t('profile.developer.demoMode.description')}
            </Body>
          </YStack>
          <Switch
            size="$3"
            checked={isDemoMode}
            onCheckedChange={handleToggleDemoMode}
            accessibilityLabel={t('profile.developer.demoMode.label')}
          >
            <Switch.Thumb {...{ animation: 'bouncy' } as any} />
          </Switch>
        </XStack>
      </Card>

      {/* Logout button */}
      <YStack marginTop="auto" paddingVertical="$2">
        <Button size="$5" backgroundColor="$danger" onPress={logout}>
          <Text color="$contentOnSemantic" fontWeight="bold">
            {t('profile.logout')}
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}
