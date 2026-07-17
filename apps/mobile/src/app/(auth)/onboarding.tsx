import { useState } from 'react';
import { YStack, XStack, Circle } from 'tamagui';
import { Title, Body, Button } from '@commitment/design-system';
import { useAuth } from '@/core/auth/use-auth';
import { FullScreenCenter } from '@/components/FullScreenCenter';

export default function OnboardingScreen() {
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
  const buttonI18nKey = isLastStep ? 'auth:onboarding.start' : 'auth:login.continue';

  return (
    <FullScreenCenter paddingHorizontal="$6">
      <YStack flex={1} width="100%" justifyContent="center" alignItems="center" gap="$8">

        <YStack height={200} justifyContent="center" alignItems="center" gap="$4">
          <Title
            fontSize="$8"
            fontWeight="bold"
            textAlign="center"
            i18nKey={`auth:onboarding.${currentStep}.title`}
          />
          <Body
            tone="secondary"
            fontSize="$5"
            textAlign="center"
            i18nKey={`auth:onboarding.${currentStep}.subtitle`}
          />
        </YStack>

        <XStack gap="$3" marginBottom="$8">
          {[1, 2, 3].map((idx) => (
            <Circle
              key={idx}
              size={12}
              backgroundColor={idx === step ? '$accent' : '$divider'}
            />
          ))}
        </XStack>

        <Button variant="primary" size="large" fullWidth onPress={handleNext} i18nKey={buttonI18nKey} />
      </YStack>
    </FullScreenCenter>
  );
}
