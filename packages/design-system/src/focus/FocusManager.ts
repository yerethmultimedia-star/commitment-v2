import { Platform } from 'react-native';

export type FocusContextType = 'screen' | 'dialog' | 'bottomSheet' | 'roving';

export interface FocusContextConfig {
  initialFocusRef?: any;
  restoreFocusRef?: any;
  onEscape?: () => void;
  trapContainerRef?: any;
}

class FocusManagerClass {
  private contextStack: { id: string; type: FocusContextType; config: FocusContextConfig }[] = [];

  constructor() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  pushContext(id: string, type: FocusContextType, config: FocusContextConfig) {
    this.contextStack.push({ id, type, config });
    this.applyContext(config);
  }

  popContext(id: string) {
    const idx = this.contextStack.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const removed = this.contextStack.splice(idx, 1)[0];
      if (removed && removed.config.restoreFocusRef?.current) {
        setTimeout(() => {
          removed.config.restoreFocusRef.current.focus?.();
        }, 50);
      }
      if (this.contextStack.length > 0) {
        const lastContext = this.contextStack[this.contextStack.length - 1];
        if (lastContext) {
          this.applyContext(lastContext.config);
        }
      }
    }
  }

  private applyContext(config: FocusContextConfig) {
    if (config.initialFocusRef?.current) {
      setTimeout(() => {
        config.initialFocusRef.current.focus?.();
      }, 50);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.contextStack.length > 0) {
      const active = this.contextStack[this.contextStack.length - 1];
      if (active && active.config.onEscape) {
        active.config.onEscape();
      }
    }
  };
}

export const FocusManager = new FocusManagerClass();
export default FocusManager;
