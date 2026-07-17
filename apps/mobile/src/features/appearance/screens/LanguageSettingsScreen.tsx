import React from 'react';
import { YStack, XStack } from 'tamagui';
import { Check } from '@tamagui/lucide-icons';
import { useTranslation } from 'react-i18next';
import { AppScreen, Card, Title, Body, LoadingState, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useAppearanceStore } from '../store/use-appearance-store';

const LANGUAGES: { code: string; nameKey: string }[] = [
  { code: 'en', nameKey: 'settings.language.english' },
  { code: 'es', nameKey: 'settings.language.spanish' },
];

export const LanguageSettingsScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { appearance, isLoading, updateSettings } = useAppearanceStore();
  const settings = appearance?.settings;

  if (isLoading || !settings) {
    return <LoadingState title={{ i18nKey: 'appearance.loading' }} />;
  }

  return (
    <AppScreen scrollable>
      <YStack padding="$4" gap="$4">
        <Title i18nKey="settings.language.title" fontSize="$6" fontWeight="bold" />
        <Card variant="elevated" padding={0} overflow="hidden">
          {LANGUAGES.map((lang, index) => {
            const active = settings.locale === lang.code;
            return (
              <XStack
                key={lang.code}
                onPress={() => updateSettings({ locale: lang.code })}
                paddingHorizontal="$4"
                paddingVertical="$3"
                justifyContent="space-between"
                alignItems="center"
                borderTopWidth={index === 0 ? 0 : 1}
                borderTopColor="$divider"
                pressStyle={{ opacity: 0.7 }}
                {...toPlatformAccessibilityProps({
                  accessibilityRole: 'button',
                  accessibilityState: { selected: active },
                })}
              >
                <Body fontSize="$4">{t(lang.nameKey)}</Body>
                {active && <Check size={20} color="$accent" />}
              </XStack>
            );
          })}
        </Card>
      </YStack>
    </AppScreen>
  );
};
