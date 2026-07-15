import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';

export const MotivationWidget = React.memo(function MotivationWidget() {
  const { t } = useTranslation();

  const quote = useMemo(() => {
    // Choose a quote based on the day of the month
    const day = new Date().getDate();
    const index = day % 4;
    
    return {
      text: t(`dashboard.widgets.motivation.quotes.${index}`, {
        defaultValue: [
          "The secret of getting ahead is getting started.",
          "It always seems impossible until it's done.",
          "Quality is not an act, it is a habit.",
          "Your only limit is you. Push yourself today."
        ][index]
      }),
      author: t(`dashboard.widgets.motivation.authors.${index}`, {
        defaultValue: [
          "Mark Twain",
          "Nelson Mandela",
          "Aristotle",
          "Unknown"
        ][index]
      })
    };
  }, [t]);

  return (
    <Card variant="elevated" padding={0} overflow="hidden">
      <YStack 
        padding="$4" 
        backgroundColor="$accent"
        borderRadius="$4"
        gap="$2"
      >
        <Text fontSize="$3" fontWeight="bold" color="$contentOnAccent" opacity={0.8} textTransform="uppercase" letterSpacing={1}>
          {t('dashboard.widgets.motivation.title', { defaultValue: 'Daily Spark' })}
        </Text>

        <Text fontSize="$5" fontWeight="600" color="$contentOnAccent" fontStyle="italic" lineHeight={22} marginTop="$1">
          "{quote.text}"
        </Text>

        <Text fontSize="$2" fontWeight="bold" color="$contentOnAccent" opacity={0.9} textAlign="right" marginTop="$1">
          — {quote.author}
        </Text>
      </YStack>
    </Card>
  );
});
