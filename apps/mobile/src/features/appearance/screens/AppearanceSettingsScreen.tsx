import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Separator } from 'tamagui';
import { AppScreen, Body, LoadingState, SectionHeader, Switch } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { appThemeRegistry } from '../providers/theme-registry';
import { useAppearanceStore } from '../store/use-appearance-store';
import { ThemePreviewCard } from '../components/ThemePreviewCard';

export const AppearanceSettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { appearance, isLoading, updateSettings } = useAppearanceStore();
  const settings = appearance?.settings;

  const metadataList = appThemeRegistry.getAllMetadata();

  if (isLoading || !settings) {
    return <LoadingState title={{ i18nKey: 'appearance.loading' }} />;
  }

  return (
    <AppScreen>
      <YStack padding="$4" gap="$6">

        <YStack gap="$4">
          <SectionHeader
            size="screen"
            title={{ i18nKey: 'appearance.settings.theme.title' }}
            subtitle={{ i18nKey: 'appearance.settings.theme.description' }}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$4" paddingBottom="$4">
              {metadataList.map(meta => {
                const isSelected = settings.themeId === meta.id;
                // Get the raw resolved theme for the preview card to draw it independently
                const resolvedTheme = appThemeRegistry.resolve(meta.id);
                return (
                  <YStack key={meta.id} gap="$2" alignItems="center">
                    <ThemePreviewCard
                      metadata={meta}
                      theme={resolvedTheme}
                      isSelected={isSelected}
                      onSelect={(id: string) => updateSettings({ themeId: id })}
                    />
                    <Body
                      fontSize="$3"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      color={isSelected ? '$contentPrimary' : '$contentSecondary'}
                    >
                      {t(meta.nameKey)}
                    </Body>
                  </YStack>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>

        <Separator borderColor="$divider" />

        <YStack gap="$4">
          <SectionHeader
            size="screen"
            title={{ i18nKey: 'appearance.settings.accessibility.title' }}
            subtitle={{ i18nKey: 'appearance.settings.accessibility.description' }}
          />

          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
            labelI18nKey="appearance.settings.reducedMotion.label"
            descriptionI18nKey="appearance.settings.reducedMotion.description"
          />

          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
            labelI18nKey="appearance.settings.highContrast.label"
            descriptionI18nKey="appearance.settings.highContrast.description"
          />

        </YStack>

      </YStack>
    </AppScreen>
  );
};
