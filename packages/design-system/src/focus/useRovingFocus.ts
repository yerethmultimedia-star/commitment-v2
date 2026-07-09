import { useState, useCallback } from 'react';

export const useRovingFocus = (itemCount: number, initialIndex = 0) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const getTabIndex = useCallback(
    (index: number) => {
      return index === activeIndex ? 0 : -1;
    },
    [activeIndex]
  );

  const handleKeyPress = useCallback(
    (index: number, e: any) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const next = (index + 1) % itemCount;
        setActiveIndex(next);
        e.preventDefault();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const prev = (index - 1 + itemCount) % itemCount;
        setActiveIndex(prev);
        e.preventDefault();
      }
    },
    [itemCount]
  );

  return { activeIndex, getTabIndex, handleKeyPress, setActiveIndex };
};
