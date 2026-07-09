import { YStack } from 'tamagui';

export function CommitmentsSkeleton() {
  return (
    <YStack gap="$4" padding="$4">
      {[1, 2, 3, 4, 5].map((i) => (
        <YStack 
          key={i} 
          backgroundColor="$backgroundElement" 
          height={80} 
          borderRadius="$4" 
          opacity={0.5} 
        />
      ))}
    </YStack>
  );
}
