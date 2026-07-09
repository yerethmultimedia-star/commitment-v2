import { YStack, styled } from 'tamagui';

export const Card = styled(YStack, {
  backgroundColor: '$surfaceRaised',
  borderRadius: '$4', // Standard radius token from Tamagui
  padding: '$4', // Standard spacing token
  borderWidth: 1,
  borderColor: '$divider',

  // Optional subtle shadow for elevation
  shadowColor: '$contentPrimary',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },

  variants: {
    interactive: {
      true: {
        hoverStyle: {
          backgroundColor: '$backgroundSecondary',
        },
        pressStyle: {
          scale: 0.98,
        },
      },
    },
    variant: {
      flat: {
        backgroundColor: '$surface',
        shadowOpacity: 0,
        borderWidth: 0,
      },
      elevated: {
        backgroundColor: '$surfaceRaised',
        shadowOpacity: 0.08,
        borderWidth: 1,
        borderColor: 'transparent',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$divider',
        shadowOpacity: 0,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'elevated',
  },
});
