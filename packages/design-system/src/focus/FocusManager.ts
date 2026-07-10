import { Platform, BackHandler } from 'react-native';
import { announce } from '../accessibility/AccessibilityAnnouncer.js';

export interface FocusContextConfig {
  initialFocusRef?: any;
  restoreFocusRef?: any;
  trapContainerRef?: any;
  onEscape?: () => void;
  onBack?: () => void;
  announceOnFocus?: string;
  isFocusTrapActive?: boolean;
  zIndex?: number;
  modal?: boolean;
  blocking?: boolean;
}

export interface FocusContext {
  id: string;
  kind: string; // e.g. 'screen' | 'dialog' | 'bottomSheet' | 'popover' | 'menu' | 'roving'
  priority: number;
  config: FocusContextConfig;
  capturedFocusedElement?: any;
}

const DEFAULT_PRIORITIES: Record<string, number> = {
  screen: 0,
  roving: 50,
  dialog: 100,
  bottomSheet: 200,
  popover: 300,
  tooltip: 400,
  coach: 1000,
};

class FocusManagerClass {
  private contextStack: FocusContext[] = [];
  private backHandlerSubscription: any = null;

  constructor() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    } else if (Platform.OS !== 'web') {
      this.backHandlerSubscription = BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleHardwareBackPress
      );
    }
  }

  pushContext(id: string, kind: string, config: FocusContextConfig, priority?: number) {
    const capturedFocusedElement = Platform.OS === 'web' ? (document.activeElement as HTMLElement) : null;
    const resolvedPriority = priority !== undefined ? priority : (DEFAULT_PRIORITIES[kind] ?? 0);

    const context: FocusContext = {
      id,
      kind,
      priority: resolvedPriority,
      config,
      capturedFocusedElement,
    };

    this.contextStack.push(context);
    this.applyContext(context);
  }

  popContext(id: string) {
    const idx = this.contextStack.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const [removed] = this.contextStack.splice(idx, 1);
      if (removed) {
        this.restoreContextFocus(removed);
      }
      
      const newActive = this.getActiveContext();
      if (newActive) {
        this.applyContext(newActive);
      }
    }
  }

  getActiveContext(): FocusContext | undefined {
    if (this.contextStack.length === 0) return undefined;
    
    // Devolvemos el contexto con mayor prioridad.
    // Si tienen la misma prioridad, mantenemos el orden LIFO (el último en agregarse).
    return [...this.contextStack].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      const indexA = this.contextStack.indexOf(a);
      const indexB = this.contextStack.indexOf(b);
      return indexB - indexA;
    })[0];
  }

  private applyContext(context: FocusContext) {
    const config = context.config;

    if (config.announceOnFocus) {
      if (context.kind === 'screen') {
        announce.screen(config.announceOnFocus);
      } else if (context.kind === 'dialog') {
        announce.dialog(config.announceOnFocus);
      } else {
        announce(config.announceOnFocus);
      }
    }

    if (config.initialFocusRef?.current) {
      setTimeout(() => {
        config.initialFocusRef?.current?.focus?.();
      }, 50);
    }
  }

  private restoreContextFocus(context: FocusContext) {
    if (context.config.restoreFocusRef?.current) {
      const ref = context.config.restoreFocusRef;
      setTimeout(() => {
        ref.current?.focus?.();
      }, 50);
      return;
    }

    if (Platform.OS === 'web' && context.capturedFocusedElement) {
      const el = context.capturedFocusedElement;
      setTimeout(() => {
        el.focus?.();
      }, 50);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const active = this.getActiveContext();
    if (!active) return;

    if (e.key === 'Escape') {
      if (active.config.onEscape) {
        active.config.onEscape();
      }
    } else if (e.key === 'Tab') {
      if (active.config.isFocusTrapActive && active.config.trapContainerRef?.current) {
        this.handleTabTrap(e, active.config.trapContainerRef.current);
      }
    }
  };

  private handleHardwareBackPress = () => {
    const active = this.getActiveContext();
    if (!active) return false;

    if (active.config.onBack) {
      active.config.onBack();
      return true;
    }
    if (active.config.onEscape) {
      active.config.onEscape();
      return true;
    }
    return false;
  };

  private handleTabTrap(e: KeyboardEvent, container: any) {
    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  // Permite desmontar listeners globales si es necesario (ej: en tests)
  destroy() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    } else if (Platform.OS !== 'web' && this.backHandlerSubscription) {
      this.backHandlerSubscription.remove();
    }
  }
}

export const FocusManager = new FocusManagerClass();
export default FocusManager;
