
import { AppScreen, StaticScreen } from '../index.js';
import { renderWithTheme } from '../../components/__tests__/setup.js';
import { Text } from 'tamagui';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('Screen Primitives', () => {
  describe('StaticScreen', () => {
    it('renders static content correctly', async () => {
      const { toJSON } = await renderWithTheme(
        <StaticScreen>
          <Text>Static Content</Text>
        </StaticScreen>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('AppScreen', () => {
    it('renders scrollable screen by default', async () => {
      const { toJSON } = await renderWithTheme(
        <AppScreen announceOnFocus="Screen announcement">
          <Text>Content</Text>
        </AppScreen>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders static screen when scrollable=false', async () => {
      const { toJSON } = await renderWithTheme(
        <AppScreen scrollable={false}>
          <Text>Static Content</Text>
        </AppScreen>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
