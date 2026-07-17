import React from 'react';
import { SectionPrimitive, SectionText, SectionHeaderSize } from './SectionPrimitive.js';

/**
 * A standalone title/subtitle/action row — no body. Defaults to size="screen"
 * (the fuller Title+subtitle treatment), since a header used on its own is
 * usually the prominent, screen-level kind (e.g. Goals'/Coach's own header).
 * For the small uppercase group-label style (e.g. "CUENTA" above a card),
 * use FormSection/SettingsSection instead — they default to size="section".
 */
export interface SectionHeaderProps {
  title?: SectionText;
  subtitle?: SectionText;
  action?: React.ReactNode;
  size?: SectionHeaderSize;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}

export const SectionHeader = React.forwardRef<any, SectionHeaderProps>((props, ref) => (
  <SectionPrimitive ref={ref as any} size="screen" {...props} />
));

SectionHeader.displayName = 'SectionHeader';
