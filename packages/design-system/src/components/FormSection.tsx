import React from 'react';
import { YStack } from 'tamagui';
import { SectionPrimitive, SectionText, SectionSpacing } from './SectionPrimitive.js';

/**
 * A group of form fields under an optional small group label — body renders
 * as a plain vertical stack (no Card, no dividers), matching how
 * CommitmentForm/HabitForm already lay out their fields. If a bordered,
 * divided-rows look is what's needed instead (e.g. tappable settings rows),
 * that's SettingsSection, not this one.
 */
export interface FormSectionProps {
  title?: SectionText;
  subtitle?: SectionText;
  action?: React.ReactNode;
  spacing?: SectionSpacing;
  children?: React.ReactNode;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}

export const FormSection = React.forwardRef<any, FormSectionProps>(({ children, ...props }, ref) => (
  <SectionPrimitive ref={ref as any} size="section" {...props}>
    <YStack gap="$4">{children}</YStack>
  </SectionPrimitive>
));

FormSection.displayName = 'FormSection';
