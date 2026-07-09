import React from 'react';
import { FlashList } from '@shopify/flash-list';
import { KeyboardAvoidingView, Platform, StyleSheet, RefreshControl } from 'react-native';
import { View, ViewProps } from 'tamagui';
import { SafeArea } from '../layout/SafeArea.js';

export interface VirtualizedScreenProps<T = any> extends ViewProps {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  estimatedItemSize?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAware?: boolean;
  safeArea?: boolean;
}

export const VirtualizedScreen = React.forwardRef<any, VirtualizedScreenProps>(({
  data,
  renderItem,
  keyExtractor,
  estimatedItemSize = 100,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  keyboardAware = true,
  safeArea = true,
  ...props
}, ref) => {
  const ListComponent = FlashList as any;

  const flashListElement = (
    <ListComponent
      ref={ref}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={estimatedItemSize}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
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
      {flashListElement}
    </KeyboardAvoidingView>
  ) : (
    flashListElement
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

VirtualizedScreen.displayName = 'VirtualizedScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
