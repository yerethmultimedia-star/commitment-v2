import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

export interface RovingFocusConfig {
  itemCount: number;
  orientation?: 'horizontal' | 'vertical' | 'both';
  layout?: 'linear' | 'grid' | 'tree' | 'menu';
  gridCols?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
}

export const useRovingFocus = (config: RovingFocusConfig, initialIndex = 0) => {
  const {
    itemCount,
    orientation = 'both',
    layout = 'linear',
    gridCols = 1,
    loop = true,
    onIndexChange,
  } = config;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const itemRefs = useRef<any[]>([]);

  const registerItemRef = useCallback((index: number, el: any) => {
    if (el) {
      itemRefs.current[index] = el;
    }
  }, []);

  const getTabIndex = useCallback(
    (index: number) => {
      return index === activeIndex ? 0 : -1;
    },
    [activeIndex]
  );

  const focusItem = useCallback(
    (index: number) => {
      if (index < 0 || index >= itemCount) return;
      setActiveIndex(index);
      if (onIndexChange) onIndexChange(index);

      setTimeout(() => {
        const ref = itemRefs.current[index];
        if (ref) {
          ref.focus?.();
        }
      }, 10);
    },
    [itemCount, onIndexChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: any) => {
      if (Platform.OS !== 'web') return;

      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      let nextIndex = index;

      if (layout === 'grid') {
        const cols = gridCols;
        if (e.key === 'ArrowRight' && isHorizontal) {
          const row = Math.floor(index / cols);
          const col = index % cols;
          if (col + 1 < cols && (row * cols + col + 1) < itemCount) {
            nextIndex = row * cols + col + 1;
          } else if (loop) {
            nextIndex = row * cols;
          }
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' && isHorizontal) {
          const row = Math.floor(index / cols);
          const col = index % cols;
          if (col - 1 >= 0) {
            nextIndex = row * cols + col - 1;
          } else if (loop) {
            nextIndex = Math.min((row + 1) * cols - 1, itemCount - 1);
          }
          e.preventDefault();
        } else if (e.key === 'ArrowDown' && isVertical) {
          if (index + cols < itemCount) {
            nextIndex = index + cols;
          } else if (loop) {
            nextIndex = index % cols;
          }
          e.preventDefault();
        } else if (e.key === 'ArrowUp' && isVertical) {
          if (index - cols >= 0) {
            nextIndex = index - cols;
          } else if (loop) {
            const col = index % cols;
            const lastRowIndex = Math.floor((itemCount - 1) / cols) * cols + col;
            nextIndex = lastRowIndex < itemCount ? lastRowIndex : lastRowIndex - cols;
          }
          e.preventDefault();
        }
      } else if (layout === 'tree') {
        if (e.key === 'ArrowDown') {
          nextIndex = Math.min(itemCount - 1, index + 1);
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          nextIndex = Math.max(0, index - 1);
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          console.log('Tree node expand at index', index);
        } else if (e.key === 'ArrowLeft') {
          console.log('Tree node collapse at index', index);
        }
      } else if (layout === 'menu') {
        if (e.key === 'ArrowDown' && isVertical) {
          nextIndex = (index + 1) % itemCount;
          e.preventDefault();
        } else if (e.key === 'ArrowUp' && isVertical) {
          nextIndex = (index - 1 + itemCount) % itemCount;
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          console.log('Menu trigger open submenu at index', index);
        } else if (e.key === 'ArrowLeft') {
          console.log('Menu trigger close submenu at index', index);
        }
      } else {
        // Default linear
        if ((e.key === 'ArrowDown' && isVertical) || (e.key === 'ArrowRight' && isHorizontal)) {
          nextIndex = index + 1;
          if (nextIndex >= itemCount) {
            nextIndex = loop ? 0 : index;
          }
          e.preventDefault();
        } else if ((e.key === 'ArrowUp' && isVertical) || (e.key === 'ArrowLeft' && isHorizontal)) {
          nextIndex = index - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? itemCount - 1 : index;
          }
          e.preventDefault();
        }
      }

      if (e.key === 'Home') {
        nextIndex = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        nextIndex = itemCount - 1;
        e.preventDefault();
      }

      if (nextIndex !== index) {
        focusItem(nextIndex);
      }
    },
    [itemCount, orientation, layout, gridCols, loop, focusItem]
  );

  return {
    activeIndex,
    getTabIndex,
    handleKeyDown,
    setActiveIndex,
    registerItemRef,
    focusItem,
  };
};
