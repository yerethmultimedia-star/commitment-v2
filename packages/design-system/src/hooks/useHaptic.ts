import { useContext, useMemo } from 'react';
import { PlatformContext } from '../providers/PlatformProvider.js';

export const useHaptic = () => {
  const context = useContext(PlatformContext);
  
  return useMemo(() => ({
    selection: () => context?.haptics.trigger('selection'),
    success: () => context?.haptics.trigger('success'),
    warning: () => context?.haptics.trigger('warning'),
    error: () => context?.haptics.trigger('error'),
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      const type = style === 'light' ? 'impactLight' : style === 'heavy' ? 'impactHeavy' : 'impactMedium';
      context?.haptics.trigger(type);
    }
  }), [context]);
};
