import React from 'react';
import { XStack, YStack, ScrollView } from 'tamagui';
import { Body, toPlatformAccessibilityProps } from '@commitment/design-system';

/**
 * The horizontal underline tab strip shared by GoalsScreen and
 * GoalWorkspaceScreen — identical implementation existed twice before this
 * (found during the Goals Design System Adoption pass, 2026-07-15). Kept
 * feature-local, not promoted to the Design System: no other screen uses
 * this exact pattern yet (checked repo-wide), and a single feature having
 * two internal consumers doesn't meet the "real second independent
 * consumer" bar the Design System's own components (see ProgressMetric.tsx)
 * apply before generalizing.
 */
export interface GoalTabStripProps<T extends string> {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
  labelFor: (tab: T) => string;
}

export function GoalTabStrip<T extends string>({ tabs, active, onChange, labelFor }: GoalTabStripProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$md" borderBottomWidth={1} borderBottomColor="$divider">
        {tabs.map((tb) => (
          <YStack
            key={tb}
            onPress={() => onChange(tb)}
            paddingBottom="$2"
            borderBottomWidth={2}
            borderBottomColor={active === tb ? '$accent' : 'transparent'}
            {...toPlatformAccessibilityProps({
              accessibilityRole: 'button',
              accessibilityState: { selected: active === tb },
            })}
          >
            <Body fontWeight={active === tb ? '700' : '500'} color={active === tb ? '$accent' : '$contentSecondary'}>
              {labelFor(tb)}
            </Body>
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  );
}
