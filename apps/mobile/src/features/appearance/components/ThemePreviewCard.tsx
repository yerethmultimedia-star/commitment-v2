import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ResolvedTheme, ThemeMetadata } from '@commitment/theme-engine';
import { adaptThemeToTamagui, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
// We use raw React Native components here so we can inject the theme locally
// without relying on the global Tamagui provider which only has the currently active theme.

interface ThemePreviewCardProps {
  metadata: ThemeMetadata;
  theme: ResolvedTheme;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  metadata,
  theme,
  isSelected,
  onSelect,
}) => {
  const { t } = useTranslation();
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.radius;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => onSelect(metadata.id)}
      style={[
        styles.container,
        {
          backgroundColor: c.background,
          borderColor: isSelected ? c.interactive : c.divider,
          borderWidth: isSelected ? 2 : 1,
          borderRadius: r['4'],
        }
      ]}
      {...toPlatformAccessibilityProps({
        accessibilityRole: 'button',
        accessibilityState: { selected: isSelected },
        accessibilityLabel: t(metadata.nameKey),
      })}
    >
      <View style={[styles.previewArea, { backgroundColor: c.background }]}>
        {/* Miniature Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: c.surfaceRaised, borderRadius: r.full }]} />
          <View style={styles.headerLines}>
            <View style={[styles.line, { backgroundColor: c.contentPrimary, width: 40, height: 6 }]} />
            <View style={[styles.line, { backgroundColor: c.contentTertiary, width: 24, height: 4, marginTop: 4 }]} />
          </View>
        </View>

        {/* Miniature Commitment Card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderRadius: r['3'], borderColor: c.divider, borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.line, { backgroundColor: c.contentPrimary, width: 60, height: 5 }]} />
            <View style={[styles.dot, { backgroundColor: c.success }]} />
          </View>
          <View style={[styles.line, { backgroundColor: c.contentSecondary, width: '80%', height: 4, marginTop: 8 }]} />
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: c.backgroundSecondary, borderRadius: r.full }]}>
              <View style={[styles.progressFill, { backgroundColor: c.interactive, width: '60%', borderRadius: r.full }]} />
            </View>
          </View>
        </View>

        {/* Miniature Button */}
        <View style={[styles.button, { backgroundColor: c.interactive, borderRadius: r.full }]}>
          <View style={[styles.line, { backgroundColor: '#FFFFFF', width: 30, height: 4 }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 180,
    overflow: 'hidden',
    marginRight: 16,
  },
  previewArea: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  headerLines: {
    flex: 1,
  },
  line: {
    borderRadius: 2,
  },
  card: {
    padding: 8,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  button: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 'auto',
  }
});
