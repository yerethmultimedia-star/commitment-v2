
import { ScreenScroll, VirtualizedScreen, SectionList } from '../index.js';
import { renderWithTheme } from '../../components/__tests__/setup.js';
import { Text } from 'tamagui';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('Scroll Primitives', () => {
  describe('ScreenScroll', () => {
    it('renders scroll content correctly', () => {
      const { toJSON } = renderWithTheme(
        <ScreenScroll>
          <Text>Scroll Item</Text>
        </ScreenScroll>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('VirtualizedScreen', () => {
    it('renders data items correctly', () => {
      const data = [{ id: '1', title: 'Item 1' }];
      const { toJSON } = renderWithTheme(
        <VirtualizedScreen
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text>{item.title}</Text>}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('SectionList', () => {
    it('renders sections correctly', () => {
      const sections = [
        {
          titleI18nKey: 'section.one',
          data: [{ id: '1', title: 'Sub Item 1' }],
        },
      ];
      const { toJSON } = renderWithTheme(
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text>{item.title}</Text>}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
