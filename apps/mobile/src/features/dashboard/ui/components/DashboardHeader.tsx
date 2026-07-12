import React, { useMemo } from 'react';
import { YStack, XStack, Circle } from 'tamagui';
import { Title, Body, Card } from '@commitment/design-system';
import { formatDate } from '@commitment/localization';
import { useDashboardFacade } from '@/core/facades/dashboard.facade';
import { getActiveHeroCard } from './strategies/HeroCardStrategy';
import { useRouter } from 'expo-router';

export interface DashboardHeaderProps {
  commitmentsCount: number;
}

export const DashboardHeader = React.memo(function DashboardHeader({ commitmentsCount }: DashboardHeaderProps) {
  const router = useRouter();
  const { dashboard } = useDashboardFacade();

  const headerData = useMemo(() => {
    const hour = new Date().getHours();
    let greetingKey = 'dashboard.greetingMorning';
    
    if (hour >= 12 && hour < 20) {
      greetingKey = 'dashboard.greetingAfternoon';
    } else if (hour >= 20 || hour < 5) {
      greetingKey = 'dashboard.greetingEvening';
    }

    const dateStr = formatDate(new Date(), 'EEEE, d \'de\' MMMM');
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    return { greetingKey, formattedDate };
  }, []);

  const heroCard = useMemo(() => {
    return getActiveHeroCard(dashboard);
  }, [dashboard]);

  // Determine background color based on strategy theme variant
  const heroBg = heroCard.themeVariant === 'success' 
    ? '$success' 
    : heroCard.themeVariant === 'accent' 
    ? '$accent' 
    : '$interactive';

  return (
    <YStack gap="$4" paddingBottom="$3">
      {/* Top Greeting Row */}
      <XStack justifyContent="space-between" alignItems="center">
        <YStack gap="$1" flex={1}>
          <Title i18nKey={headerData.greetingKey} fontSize="$7" fontWeight="bold" letterSpacing={-0.5} />
          <Body tone="secondary" fontSize="$3">
            {headerData.formattedDate}
          </Body>
        </YStack>
        
        {/* Premium Initial-based Avatar */}
        <Circle size={44} backgroundColor="$accent" borderWidth={1} borderColor="$borderColor" marginLeft="$4" elevation={2}>
          <Title fontSize="$4" fontWeight="bold" color="white">ME</Title>
        </Circle>
      </XStack>

      {/* Summary Phrase */}
      <Body tone="secondary" fontSize="$4">
        {commitmentsCount > 0 
          ? commitmentsCount === 1 
            ? '1 active commitment' 
            : `${commitmentsCount} active commitments` 
          : 'No active commitments'}
      </Body>

      {/* Dynamic Emotional Hero Card */}
      <Card 
        variant="elevated" 
        backgroundColor={heroBg as any}
        borderColor="transparent"
        padding="$4"
        onPress={() => router.push(heroCard.actionRoute as any)}
        pressStyle={{ scale: 0.98, opacity: 0.95 }}
      >
        <XStack gap="$3" alignItems="center">
          <Circle size={50} backgroundColor="rgba(255, 255, 255, 0.2)" justifyContent="center" alignItems="center">
            <Body fontSize="$6">{heroCard.illustration}</Body>
          </Circle>

          <YStack flex={1} gap="$1">
            <Title 
              i18nKey={heroCard.titleI18nKey} 
              i18nParams={heroCard.titleParams} 
              color="white" 
              fontSize="$5" 
              fontWeight="bold" 
            />
            <Body 
              i18nKey={heroCard.subtitleI18nKey} 
              i18nParams={heroCard.subtitleParams} 
              color="rgba(255, 255, 255, 0.85)" 
              fontSize="$3" 
            />
          </YStack>
        </XStack>
      </Card>
    </YStack>
  );
});
