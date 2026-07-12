import React from 'react';
import { ScrollView } from 'react-native';
import { View, Text, Switch, YStack, XStack, Separator } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { appThemeRegistry } from '../providers/theme-registry';
import { useAppearanceStore } from '../store/use-appearance-store';
import { ThemeMetadata } from '@commitment/theme-engine';
import { ThemePreviewCard } from '../components/ThemePreviewCard';

export const AppearanceSettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { appearance, updateSettings } = useAppearanceStore();
  const settings = appearance?.settings;

  const metadataList = appThemeRegistry.getAllMetadata();

  if (!settings) return null;

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack padding="$4" gap="$6">
        
        <YStack gap="$4">
          <YStack gap="$1">
            <Text fontSize="$6" fontWeight="bold" color="$contentPrimary">
              {t('appearance.settings.theme.title')}
            </Text>
            <Text fontSize="$3" color="$contentSecondary">
              {t('appearance.settings.theme.description')}
            </Text>
          </YStack>

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
                    <Text 
                      fontSize="$3" 
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      color={isSelected ? '$contentPrimary' : '$contentSecondary'}
                    >
                      {t(meta.nameKey)}
                    </Text>
                  </YStack>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>

        <Separator borderColor="$divider" />

        <YStack gap="$4">
          <YStack gap="$1">
            <Text fontSize="$6" fontWeight="bold" color="$contentPrimary">
              {t('appearance.settings.accessibility.title')}
            </Text>
            <Text fontSize="$3" color="$contentSecondary">
              {t('appearance.settings.accessibility.description')}
            </Text>
          </YStack>

          <XStack alignItems="center" justifyContent="space-between">
            <YStack flex={1} paddingRight="$4">
              <Text fontSize="$4" color="$contentPrimary">
                {t('appearance.settings.reducedMotion.label')}
              </Text>
              <Text fontSize="$2" color="$contentSecondary" marginTop="$1">
                {t('appearance.settings.reducedMotion.description')}
              </Text>
            </YStack>
            <Switch
              size="$3"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
              accessibilityLabel={t('appearance.settings.reducedMotion.label')}
            >
              <Switch.Thumb {...{ animation: "bouncy" } as any} />
            </Switch>
          </XStack>

          <XStack alignItems="center" justifyContent="space-between">
            <YStack flex={1} paddingRight="$4">
              <Text fontSize="$4" color="$contentPrimary">
                {t('appearance.settings.highContrast.label')}
              </Text>
              <Text fontSize="$2" color="$contentSecondary" marginTop="$1">
                {t('appearance.settings.highContrast.description')}
              </Text>
            </YStack>
            <Switch
              size="$3"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
              accessibilityLabel={t('appearance.settings.highContrast.label')}
            >
              <Switch.Thumb {...{ animation: "bouncy" } as any} />
            </Switch>
          </XStack>

        </YStack>

      </YStack>
    </ScrollView>
  );
};
