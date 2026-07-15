import React from 'react';
import { XStack, YStack, Text as TamaguiText } from 'tamagui';
import { useTabBarHeightStore } from '../store/use-tab-bar-height-store';

/**
 * Custom bottom tab bar: a floating rounded pill (margin from screen edges,
 * large border radius, shadow) instead of a flush full-width bar. The
 * selected tab expands into its own pill (icon + label inline, accent
 * background) while unselected tabs stay a plain stacked icon+label —
 * matches the reference design. Props match React Navigation's
 * BottomTabBarProps exactly (state/descriptors/navigation/insets), passed
 * in via <Tabs tabBar={(props) => <FloatingTabBar {...props} />}>.
 *
 * Being `position: absolute` and floating (not flush to the screen edge),
 * this bar isn't part of normal layout flow, so React Navigation can't
 * automatically reserve bottom space for it in scrollable screen content
 * the way it does for a standard flush tab bar. It reports its own measured
 * height + bottom offset into a small store (onLayout below) so screens can
 * read that back (see useTabBarHeightStore) and pad their scroll content —
 * otherwise the last item(s) on any tab screen render underneath the bar.
 */
export function FloatingTabBar({ state, descriptors, navigation, insets }: any) {
  const setReservedHeight = useTabBarHeightStore((s) => s.setReservedHeight);
  const bottomOffset = (insets?.bottom ?? 0) + 12;

  return (
    <XStack
      position="absolute"
      left={16}
      right={16}
      bottom={bottomOffset}
      backgroundColor="$surfaceRaised"
      borderRadius={32}
      paddingVertical="$2"
      paddingHorizontal="$2"
      justifyContent="space-around"
      alignItems="center"
      shadowColor="$contentPrimary"
      shadowOpacity={0.15}
      shadowRadius={16}
      shadowOffset={{ width: 0, height: 6 }}
      elevation={8}
      onLayout={(e: any) => setReservedHeight(e.nativeEvent.layout.height + bottomOffset)}
      accessibilityRole="tablist"
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        // href: null (see (tabs)/_layout.tsx's "tasks" route) hides a route
        // from the tab bar without removing it. Expo Router destructures
        // `href` out of options entirely and turns it into
        // `tabBarItemStyle: { display: 'none' }` instead (see
        // expo-router's TabsClient.js) — that's the flag a custom tabBar
        // actually has to check; `options.href` itself is never present.
        if ((options.tabBarItemStyle as any)?.display === 'none') return null;

        const focused = state.index === index;
        const label = options.title ?? route.name;
        const color = focused ? '$contentOnAccent' : '$contentSecondary';
        const icon = options.tabBarIcon?.({ focused, color, size: 20 });

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (focused) {
          return (
            <XStack
              key={route.key}
              onPress={onPress}
              backgroundColor="$interactive"
              borderRadius={999}
              paddingHorizontal="$3"
              paddingVertical="$2"
              alignItems="center"
              gap="$2"
              accessibilityRole="tab"
              accessibilityState={{ selected: true }}
              accessibilityLabel={label}
            >
              {icon}
              <TamaguiText color="$contentOnAccent" fontSize="$3" fontWeight="600">
                {label}
              </TamaguiText>
            </XStack>
          );
        }

        return (
          <YStack
            key={route.key}
            onPress={onPress}
            alignItems="center"
            gap="$1"
            paddingHorizontal="$2"
            paddingVertical="$1"
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
            accessibilityLabel={label}
          >
            {icon}
            <TamaguiText color="$contentSecondary" fontSize="$1">
              {label}
            </TamaguiText>
          </YStack>
        );
      })}
    </XStack>
  );
}
