import { YStack, XStack, Circle } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Settings, Bell, SlidersHorizontal, ChevronRight } from '@tamagui/lucide-icons';
import { useAuth } from '@/core/auth/use-auth';
import { useSession } from '@/core/auth/use-session';
import { formatDate } from '@commitment/localization';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppScreen, Card, Title, Body, IconButton, Button, Switch, LoadingState, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useDemoModeStore } from '@/core/demo/demo-mode.store';
import { useTabBarHeightStore } from '@/shared/store/use-tab-bar-height-store';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { registerForPushNotifications } from '@/core/notifications/push-registration';

export default function ProfileScreen() {
  const { t } = useTranslation('common');
  const { logout } = useAuth();
  const tabBarInset = useTabBarHeightStore((s) => s.reservedHeight);
  const { identityId } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();
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
    queryClient.invalidateQueries({ queryKey: ['profile'] });
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

  if (profileLoading || !profile) {
    return (
      <AppScreen scrollable announceOnFocus="Profile screen loaded" contentBottomInset={tabBarInset}>
        <YStack backgroundColor="$background" paddingHorizontal="$4" paddingTop="$6" paddingBottom="$6">
          <LoadingState fullscreen={false} title={{ i18nKey: 'profile.loading' }} />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable announceOnFocus="Profile screen loaded" contentBottomInset={tabBarInset}>
      <YStack backgroundColor="$background" paddingHorizontal="$4" paddingTop="$6" paddingBottom="$6" gap="$4">
        {/* Header: title + settings gear */}
        <XStack justifyContent="space-between" alignItems="center">
          <Title i18nKey="profile.header.title" fontSize="$6" fontWeight="bold" />
          <IconButton
            iconToken={<Settings size={20} color="$contentSecondary" />}
            tooltipI18nKey="settings.title"
            onPress={() => router.push('/(settings)' as any)}
          />
        </XStack>

        {/* Identity row: avatar, name, plan badge, email, member since. Name/
            email/plan are only ever real in Demo Mode — see profile.api.ts,
            there's no real Identity/Profile backend yet (same situation as
            Goal, TECH_DEBT.md TD-10/A1). Each optional field renders only
            when profile actually has it, rather than showing fabricated
            personal data as if it were real. */}
        <XStack gap="$3" alignItems="center">
          <Circle size={60} backgroundColor="$accent" borderWidth={1} borderColor="$divider" elevation={2}>
            <Body fontSize="$6" fontWeight="bold" color="$contentOnAccent">{profile.avatarInitials}</Body>
          </Circle>
          <YStack flex={1} gap="$1">
            <XStack alignItems="center" gap="$2">
              <Body fontSize="$5" fontWeight="700">{profile.name ?? t('profile.noName')}</Body>
              {profile.plan && (
                <XStack backgroundColor="$accent" paddingHorizontal="$2" paddingVertical={2} borderRadius="$2">
                  <Body fontSize="$1" fontWeight="700" color="$contentOnAccent">{profile.plan}</Body>
                </XStack>
              )}
            </XStack>
            {profile.email && <Body tone="secondary" fontSize="$3">{profile.email}</Body>}
            {profile.memberSince && (
              <Body tone="secondary" fontSize="$2">
                {t('profile.memberSince', { date: formatDate(profile.memberSince, 'MMM yyyy') })}
              </Body>
            )}
          </YStack>
        </XStack>

        {/* MI PLAN — only shown when there's real plan data to show (Demo Mode only today). */}
        {profile.isDemoProfile && profile.plan && (
          <>
            <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
              {t('profile.plan.title')}
            </Body>
            <Card variant="elevated">
              <XStack justifyContent="space-between" alignItems="center">
                <YStack gap="$1">
                  <Body fontWeight="700" fontSize="$4">{t('profile.plan.planLabel', { plan: profile.plan })}</Body>
                  {profile.planRenewalDate && (
                    <Body tone="secondary" fontSize="$2">
                      {t('profile.plan.renewal', { date: formatDate(profile.planRenewalDate, 'd MMM yyyy') })}
                    </Body>
                  )}
                </YStack>
                {/* Plain text, not a button — no real billing/subscription management exists to link to. */}
                <Body color="$accent" fontWeight="600" fontSize="$3">{t('profile.plan.manage')}</Body>
              </XStack>
            </Card>
          </>
        )}

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
            {...toPlatformAccessibilityProps({
              accessibilityRole: 'button',
              accessibilityLabel: t('profile.account.preferences'),
            })}
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
            {...toPlatformAccessibilityProps({
              accessibilityRole: 'button',
              accessibilityLabel: t('profile.account.notifications'),
              accessibilityHint: t('profile.account.notificationsDescription'),
            })}
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
            <Body fontSize="$3" color="$contentPrimary" numberOfLines={1} flex={1} marginRight="$2" fontFamily="$mono">
              {identityId}
            </Body>
            <Button
              variant="secondary"
              size="small"
              i18nKey={copied ? 'profile.copied' : 'profile.copy'}
              onPress={handleCopyId}
            />
          </XStack>
        </Card>

        <Card variant="elevated" gap="$2">
          <XStack justifyContent="space-between" paddingVertical="$1">
            <Body fontSize="$4" tone="secondary">{t('profile.version')}</Body>
            <Body fontSize="$4" fontWeight="500" color="$contentPrimary">{Constants.expoConfig?.version || '1.0.0'}</Body>
          </XStack>
          <XStack justifyContent="space-between" paddingVertical="$1">
            <Body fontSize="$4" tone="secondary">{t('profile.environment')}</Body>
            <Body fontSize="$4" fontWeight="500" textTransform="capitalize" color="$contentPrimary">{process.env.NODE_ENV}</Body>
          </XStack>
        </Card>

        <Card variant="elevated" gap="$2">
          <Switch
            checked={isDemoMode}
            onCheckedChange={handleToggleDemoMode}
            labelI18nKey="profile.developer.demoMode.label"
            descriptionI18nKey="profile.developer.demoMode.description"
          />
        </Card>

        {/* Logout button — was pinned to the screen bottom via marginTop="auto"
            when this screen didn't scroll; inside AppScreen's ScrollView that
            trick no longer applies (content isn't stretched to fill the
            viewport), so it now sits at the end of the list like every other
            scrollable settings-style screen in the app. */}
        <YStack paddingVertical="$2">
          <Button variant="primary" destructive size="large" i18nKey="profile.logout" onPress={logout} fullWidth />
        </YStack>
      </YStack>
    </AppScreen>
  );
}
