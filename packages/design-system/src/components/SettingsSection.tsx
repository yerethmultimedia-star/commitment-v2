import React from 'react';
import { YStack } from 'tamagui';
import { Card } from './Card.js';
import { SectionPrimitive, SectionText, SectionSpacing } from './SectionPrimitive.js';

/**
 * A group of tappable/informational rows under an optional small group
 * label, wrapped in a single Card with a divider auto-inserted between each
 * child — matches the existing "CUENTA"/"MI PLAN" card pattern in
 * profile.tsx (each row is a Feature-owned component; this only owns the
 * card shell + divider placement, not the row content itself).
 */
export interface SettingsSectionProps {
  title?: SectionText;
  subtitle?: SectionText;
  action?: React.ReactNode;
  spacing?: SectionSpacing;
  children?: React.ReactNode;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}

export const SettingsSection = React.forwardRef<any, SettingsSectionProps>(({ children, ...props }, ref) => {
  const rows = React.Children.toArray(children);

  return (
    <SectionPrimitive ref={ref as any} size="section" {...props}>
      <Card variant="elevated" padding={0} overflow="hidden">
        {rows.map((row, index) => (
          <YStack key={index} borderTopWidth={index === 0 ? 0 : 1} borderTopColor="$divider">
            {row}
          </YStack>
        ))}
      </Card>
    </SectionPrimitive>
  );
});

SettingsSection.displayName = 'SettingsSection';
