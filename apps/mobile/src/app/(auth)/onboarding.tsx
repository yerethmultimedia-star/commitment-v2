import { useState } from 'react';
import { YStack, Text, Button, XStack, Circle } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/auth/use-auth';
import { FullScreenCenter } from '@/components/FullScreenCenter';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const currentStep = `step${step}` as 'step1' | 'step2' | 'step3';
  const isLastStep = step === 3;

  return (
    <FullScreenCenter paddingHorizontal="$6">
      <YStack flex={1} width="100%" justifyContent="center" alignItems="center" gap="$8">
        
        <YStack height={200} justifyContent="center" alignItems="center" gap="$4">
          <Text fontSize="$8" fontWeight="bold" textAlign="center">
            {t(`onboarding.${currentStep}.title`, { ns: 'auth' })}
          </Text>
          <Text fontSize="$5" color="$gray10" textAlign="center">
            {t(`onboarding.${currentStep}.subtitle`, { ns: 'auth' })}
          </Text>
        </YStack>

        <XStack gap="$3" marginBottom="$8">
          {[1, 2, 3].map((idx) => (
            <Circle 
              key={idx} 
              size={12} 
              backgroundColor={idx === step ? '$blue10' : '$gray5'} 
            />
          ))}
        </XStack>

        <Button size="$6" theme="active" width="100%" onPress={handleNext}>
          {isLastStep ? t('onboarding.start', { ns: 'auth' }) : t('login.continue', { ns: 'auth' })}
        </Button>
      </YStack>
    </FullScreenCenter>
  );
}
