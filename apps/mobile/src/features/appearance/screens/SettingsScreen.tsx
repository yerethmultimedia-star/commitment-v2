import React from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { ChevronRight } from '@tamagui/lucide-icons';
import { useTranslation } from 'react-i18next';
import { AppScreen, Card, Title, Body, toPlatformAccessibilityProps } from '@commitment/design-system';
import { appThemeRegistry } from '../providers/theme-registry';
import { useAppearanceStore } from '../store/use-appearance-store';

const LANGUAGE_NAME_KEY: Record<string, string> = {
  en: 'settings.language.english',
  es: 'settings.language.spanish',
};

/**
 * "Configuración" — the settings hub reached from Profile's gear icon.
 * Only APARIENCIA (Tema + Idioma) is real today; RECORDATORIOS/IA sections
 * from the reference design are omitted rather than shipped as
 * non-functional toggles — see this session's Profile redesign scope notes.
 */
export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { appearance } = useAppearanceStore();
  const settings = appearance?.settings;

  if (!settings) return null;

  const activeTheme = appThemeRegistry.getAllMetadata().find((m) => m.id === settings.themeId);
  const themeName = activeTheme ? t(activeTheme.nameKey) : settings.themeId;
  const languageName = t(LANGUAGE_NAME_KEY[settings.locale] ?? LANGUAGE_NAME_KEY.en);

  return (
    <AppScreen scrollable>
      <YStack padding="$4" gap="$4">
        <Title i18nKey="settings.title" fontSize="$6" fontWeight="bold" />

        <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
          {t('settings.sections.appearance')}
        </Body>
        <Card variant="elevated" padding={0} overflow="hidden">
          <XStack
            onPress={() => router.push('/(settings)/appearance' as any)}
            paddingHorizontal="$4"
            paddingVertical="$3"
            justifyContent="space-between"
            alignItems="center"
            pressStyle={{ opacity: 0.7 }}
            {...toPlatformAccessibilityProps({
              accessibilityRole: 'button',
              accessibilityLabel: `${t('settings.rows.theme')}: ${themeName}`,
            })}
          >
            <Body fontSize="$4">{t('settings.rows.theme')}</Body>
            <XStack alignItems="center" gap="$2">
              <Body tone="secondary" fontSize="$3">{themeName}</Body>
              <ChevronRight size={18} color="$contentTertiary" />
            </XStack>
          </XStack>
          <XStack
            onPress={() => router.push('/(settings)/language' as any)}
            paddingHorizontal="$4"
            paddingVertical="$3"
            justifyContent="space-between"
            alignItems="center"
            borderTopWidth={1}
            borderTopColor="$divider"
            pressStyle={{ opacity: 0.7 }}
            {...toPlatformAccessibilityProps({
              accessibilityRole: 'button',
              accessibilityLabel: `${t('settings.rows.language')}: ${languageName}`,
            })}
          >
            <Body fontSize="$4">{t('settings.rows.language')}</Body>
            <XStack alignItems="center" gap="$2">
              <Body tone="secondary" fontSize="$3">{languageName}</Body>
              <ChevronRight size={18} color="$contentTertiary" />
            </XStack>
          </XStack>
        </Card>
      </YStack>
    </AppScreen>
  );
};
