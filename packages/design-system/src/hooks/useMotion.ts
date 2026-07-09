import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useFadeIn(duration: number = 300, delay: number = 0) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [duration, delay, opacity]);

  return { opacity };
}

export function useSlideUp(distance: number = 20, duration: number = 300, delay: number = 0) {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [distance, duration, delay, translateY, opacity]);

  return { transform: [{ translateY }], opacity };
}

export function usePressAnimation() {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return {
    style: { transform: [{ scale }] },
    handlers: {
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
    },
  };
}
