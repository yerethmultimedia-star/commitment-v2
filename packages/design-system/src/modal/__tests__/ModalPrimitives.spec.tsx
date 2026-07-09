
import { ModalPrimitive, Dialog, BottomSheet, ConfirmationDialog, ActionSheet } from '../index.js';
import { renderWithTheme } from '../../components/__tests__/setup.js';
import { Text } from 'tamagui';
import { PortalProvider } from '../../portal/index.js';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
}));

describe('Modal Primitives', () => {
  describe('ModalPrimitive', () => {
    it('renders correct content when open', () => {
      const { toJSON } = renderWithTheme(
        <PortalProvider>
          <ModalPrimitive open={true} onOpenChange={() => {}}>
            <Text>Modal Content</Text>
          </ModalPrimitive>
        </PortalProvider>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('does not render when closed', () => {
      const { toJSON } = renderWithTheme(
        <PortalProvider>
          <ModalPrimitive open={false} onOpenChange={() => {}}>
            <Text>Modal Content</Text>
          </ModalPrimitive>
        </PortalProvider>
      );
      expect(toJSON()).toBeNull();
    });
  });

  describe('Dialog', () => {
    it('renders centered Dialog', () => {
      const { toJSON } = renderWithTheme(
        <PortalProvider>
          <Dialog open={true} onOpenChange={() => {}}>
            <Text>Dialog Content</Text>
          </Dialog>
        </PortalProvider>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('BottomSheet', () => {
    it('renders bottom sheet modal on Web', () => {
      const { toJSON } = renderWithTheme(
        <PortalProvider>
          <BottomSheet open={true} onOpenChange={() => {}}>
            <Text>BottomSheet Content</Text>
          </BottomSheet>
        </PortalProvider>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('ConfirmationDialog', () => {
    it('renders confirmation text and buttons', () => {
      const { toJSON, getByText } = renderWithTheme(
        <PortalProvider>
          <ConfirmationDialog
            open={true}
            onOpenChange={() => {}}
            titleI18nKey="confirm.title"
            descriptionI18nKey="confirm.description"
            confirmI18nKey="action.confirm"
            cancelI18nKey="action.cancel"
            onConfirm={() => {}}
          />
        </PortalProvider>
      );
      expect(getByText('[TR] confirm.title')).toBeTruthy();
      expect(getByText('[TR] confirm.description')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('ActionSheet', () => {
    it('renders a list of actions and cancel button', () => {
      const actions = [
        { labelI18nKey: 'action.delete', onPress: () => {}, destructive: true },
        { labelI18nKey: 'action.edit', onPress: () => {} },
      ];
      const { toJSON } = renderWithTheme(
        <PortalProvider>
          <ActionSheet
            open={true}
            onOpenChange={() => {}}
            actions={actions}
          />
        </PortalProvider>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
