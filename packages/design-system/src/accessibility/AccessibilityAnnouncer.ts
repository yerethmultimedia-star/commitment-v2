import { AccessibilityInfo, Platform } from 'react-native';

const triggerAnnouncement = (message: string) => {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      let element = document.getElementById('accessibility-live-region');
      if (!element) {
        element = document.createElement('div');
        element.id = 'accessibility-live-region';
        element.setAttribute('aria-live', 'polite');
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
      // Small timeout to trigger screen reader announcement on change
      setTimeout(() => {
        if (element) element.textContent = message;
      }, 50);
    }
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
};

export const announce = (message: string) => {
  triggerAnnouncement(message);
};

announce.screen = (message: string) => {
  triggerAnnouncement(message);
};

announce.dialog = (message: string) => {
  triggerAnnouncement(message);
};

announce.error = (message: string) => {
  triggerAnnouncement(message);
};

announce.success = (message: string) => {
  triggerAnnouncement(message);
};

announce.loading = (message: string) => {
  triggerAnnouncement(message);
};
