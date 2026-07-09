import React from 'react';
import { SectionList as RNSectionList, KeyboardAvoidingView, Platform, StyleSheet, RefreshControl } from 'react-native';
import { View, ViewProps } from 'tamagui';
import { SafeArea } from '../layout/SafeArea.js';
import { Title } from '../components/typography/index.js';

export interface SectionListData<T = any> {
  titleI18nKey?: string;
  data: T[];
  [key: string]: any;
}

export interface SectionListProps<T = any> extends ViewProps {
  sections: SectionListData<T>[];
  renderItem: (info: { item: T; index: number; section: SectionListData<T> }) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  renderSectionHeader?: (info: { section: SectionListData<T> }) => React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAware?: boolean;
  safeArea?: boolean;
}

export const SectionList = React.forwardRef<any, SectionListProps>(({
  sections,
  renderItem,
  keyExtractor,
  renderSectionHeader,
  refreshing = false,
  onRefresh,
  keyboardAware = true,
  safeArea = true,
  ...props
}, ref) => {
  const defaultRenderSectionHeader = ({ section }: { section: SectionListData }) => {
    if (!section.titleI18nKey) return null;
    return (
      <View paddingVertical="$2" backgroundColor="$background" paddingHorizontal="$4">
        <Title i18nKey={section.titleI18nKey} />
      </View>
    );
  };

  const listElement = (
    <RNSectionList
      ref={ref as any}
      sections={sections as any}
      renderItem={renderItem as any}
      keyExtractor={keyExtractor as any}
      renderSectionHeader={renderSectionHeader ? (renderSectionHeader as any) : defaultRenderSectionHeader}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );

  const keyboardElement = keyboardAware ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {listElement}
    </KeyboardAvoidingView>
  ) : (
    listElement
  );

  if (safeArea) {
    return (
      <SafeArea edges={['top', 'bottom']} style={styles.container}>
        <View style={styles.container} {...props}>
          {keyboardElement}
        </View>
      </SafeArea>
    );
  }

  return (
    <View style={styles.container} {...props}>
      {keyboardElement}
    </View>
  );
});

SectionList.displayName = 'SectionList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
