import React from 'react';
import { Text as TamaguiText, styled, GetProps } from 'tamagui';
import { useTranslation } from '@commitment/localization';

export type TypographyRole = 'display' | 'headline' | 'title' | 'subtitle' | 'body' | 'label' | 'caption' | 'overline';
export type Tone = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'disabled' | 'inverse';

// Internal styled Tamagui Text
const StyledText = styled(TamaguiText, {
  name: 'TextBase',
  fontFamily: '$body',

  variants: {
    role: {
      display: { fontSize: '$display', lineHeight: '$display', fontWeight: '$display', letterSpacing: '$display' },
      headline: { fontSize: '$headline', lineHeight: '$headline', fontWeight: '$headline', letterSpacing: '$headline' },
      title: { fontSize: '$title', lineHeight: '$title', fontWeight: '$title', letterSpacing: '$title' },
      subtitle: { fontSize: '$subtitle', lineHeight: '$subtitle', fontWeight: '$subtitle', letterSpacing: '$subtitle' },
      body: { fontSize: '$body', lineHeight: '$body', fontWeight: '$body', letterSpacing: '$body' },
      label: { fontSize: '$label', lineHeight: '$label', fontWeight: '$label', letterSpacing: '$label' },
      caption: { fontSize: '$caption', lineHeight: '$caption', fontWeight: '$caption', letterSpacing: '$caption' },
      overline: { fontSize: '$overline', lineHeight: '$overline', fontWeight: '$overline', letterSpacing: '$overline', textTransform: 'uppercase' },
    },
    tone: {
      primary: { color: '$contentPrimary' },
      secondary: { color: '$contentSecondary' },
      tertiary: { color: '$contentTertiary' },
      success: { color: '$success' },
      warning: { color: '$warning' },
      danger: { color: '$danger' },
      disabled: { color: '$disabled' },
      inverse: { color: '$contentInverse' },
    },
  } as const,

  defaultVariants: {
    role: 'body',
    tone: 'primary',
  },
});

type StyledTextProps = GetProps<typeof StyledText>;

export type BaseTextProps = Omit<StyledTextProps, 'children'> & {
  truncate?: boolean;
};

// XOR typing
export type TextContentProps = 
  | { i18nKey: string; children?: never; i18nParams?: Record<string, any> }
  | { children: React.ReactNode; i18nKey?: never; i18nParams?: never };

export type TextProps = BaseTextProps & TextContentProps;

export const TextBase = React.forwardRef<any, TextProps>((props, ref) => {
  const { t } = useTranslation();
  const {
    i18nKey,
    children,
    i18nParams,
    truncate,
    numberOfLines,
    allowFontScaling = true,
    maxFontSizeMultiplier = 1.5,
    ...rest
  } = props;

  const content = i18nKey ? t(i18nKey, i18nParams) : children;
  
  // Handling truncation
  const lines = truncate && !numberOfLines ? 1 : numberOfLines;

  return (
    <StyledText
      ref={ref}
      numberOfLines={lines}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      // Future-proofing RTL
      // textAlign={isRTL ? 'right' : 'left'}
      {...rest}
    >
      {content}
    </StyledText>
  );
});

TextBase.displayName = 'TextBase';
