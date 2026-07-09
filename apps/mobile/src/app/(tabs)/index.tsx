import React from 'react';
import { View, Text, Button, YStack } from 'tamagui';

export default function HomeScreen() {
  return (
    <View flex={1} alignItems="center" justifyContent="center">
      <YStack alignItems="center">
        <Text fontSize="$6" fontWeight="bold">Hello from Commitment v2!</Text>
        <Text fontSize="$4" color="$gray10">Tamagui is working.</Text>
        <Button theme="active" onPress={() => console.log('Tapped!')}>
          Get Started
        </Button>
      </YStack>
    </View>
  );
}
