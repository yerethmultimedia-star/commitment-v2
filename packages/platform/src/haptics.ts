export type HapticFeedbackType = 'selection' | 'success' | 'warning' | 'error' | 'impactLight' | 'impactMedium' | 'impactHeavy';

export interface HapticsProvider {
  /**
   * Triggers haptic feedback of the specified type.
   * Should respect user's system preferences for reduced motion / vibration if possible.
   */
  trigger(type: HapticFeedbackType): void | Promise<void>;
}
