import { AccessibilityInfo, Platform } from 'react-native';

const triggerAnnouncement = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      const id = `accessibility-live-region-${priority}`;
      let element = document.getElementById(id);
      if (!element) {
        element = document.createElement('div');
        element.id = id;
        element.setAttribute('aria-live', priority);
        element.setAttribute('aria-atomic', 'true');
        element.style.position = 'absolute';
        element.style.width = '1px';
        element.style.height = '1px';
        element.style.padding = '0';
        element.style.margin = '-1px';
        element.style.overflow = 'hidden';
        element.style.clip = 'rect(0, 0, 0, 0)';
        element.style.whiteSpace = 'nowrap';
        element.style.border = '0';
        document.body.appendChild(element);
      }
      element.textContent = '';
      // Pequeño retardo para forzar el anuncio en lectores de pantalla
      setTimeout(() => {
        if (element) element.textContent = message;
      }, 50);
    }
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
};

export interface AccessibilityAnnouncer {
  (message: string): void;
  polite(message: string): void;
  assertive(message: string): void;
  screen(message: string): void;
  dialog(message: string): void;
  error(message: string): void;
  success(message: string): void;
  loading(message: string): void;
}

const announceFn = (message: string) => {
  triggerAnnouncement(message, 'polite');
};

const announce = announceFn as unknown as AccessibilityAnnouncer;

announce.polite = (message: string) => {
  triggerAnnouncement(message, 'polite');
};

announce.assertive = (message: string) => {
  triggerAnnouncement(message, 'assertive');
};

announce.screen = (message: string) => {
  triggerAnnouncement(message, 'polite');
};

announce.dialog = (message: string) => {
  triggerAnnouncement(message, 'assertive');
};

announce.error = (message: string) => {
  triggerAnnouncement(message, 'assertive');
};

announce.success = (message: string) => {
  triggerAnnouncement(message, 'polite');
};

announce.loading = (message: string) => {
  triggerAnnouncement(message, 'polite');
};

export const useScreenAnnouncement = () => {
  return {
    announce: (message: string) => announce.screen(message),
  };
};

export { announce };

