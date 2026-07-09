import React, { useState } from 'react';
import { View } from 'tamagui';
import { Title, Body } from '../components/typography/index.js';
import { Stack } from './Stack.js';
import { Inline } from './Inline.js';
import { IconButton } from '../components/IconButton.js'; // Assuming it exists
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'; // Assuming lucide-icons are installed

export interface SectionProps {
  titleI18nKey?: string;
  subtitleI18nKey?: string;
  action?: React.ReactNode;
  divider?: boolean;
  collapsible?: boolean;
  accessibilityHeading?: boolean;
  children?: React.ReactNode;
}

export const Section = React.forwardRef<any, SectionProps>(({
  titleI18nKey,
  subtitleI18nKey,
  action,
  divider = false,
  collapsible = false,
  accessibilityHeading = true,
  children,
}, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <Stack ref={ref as any} gap="$md" paddingVertical="$4" borderBottomWidth={divider ? 1 : 0} borderBottomColor="$divider">
      {(titleI18nKey || subtitleI18nKey || action || collapsible) && (
        <Inline justifyContent="space-between" alignItems="center">
          <Stack gap="$xs" flex={1}>
            {titleI18nKey && (
              <Title
                i18nKey={titleI18nKey}
                accessibilityRole={accessibilityHeading ? 'header' : undefined}
              />
            )}
            {subtitleI18nKey && (
              <Body i18nKey={subtitleI18nKey} tone="secondary" />
            )}
          </Stack>
          
          <Inline alignItems="center" gap="$sm">
            {action}
            {collapsible && (
              <IconButton
                iconToken={isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                onPress={handleToggle}
                accessibilityHintI18nKey={isCollapsed ? 'action.expand' : 'action.collapse'}
                variant="ghost"
              />
            )}
          </Inline>
        </Inline>
      )}

      {!isCollapsed && (
        <View>
          {children}
        </View>
      )}
    </Stack>
  );
});

Section.displayName = 'Section';
