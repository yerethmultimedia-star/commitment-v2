
import { KeyboardSpacer, KeyboardDismissArea, KeyboardAwareScroll, KeyboardProvider } from '../index.js';
import { renderWithTheme } from '../../components/__tests__/setup.js';
import { Text } from 'tamagui';

describe('Keyboard Primitives', () => {
  it('renders KeyboardSpacer correctly', async () => {
    const { toJSON } = await renderWithTheme(
      <KeyboardProvider>
        <KeyboardSpacer />
      </KeyboardProvider>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders KeyboardDismissArea correctly', async () => {
    const { toJSON } = await renderWithTheme(
      <KeyboardDismissArea>
        <Text>Content</Text>
      </KeyboardDismissArea>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders KeyboardAwareScroll correctly', async () => {
    const { toJSON } = await renderWithTheme(
      <KeyboardProvider>
        <KeyboardAwareScroll>
          <Text>Content</Text>
        </KeyboardAwareScroll>
      </KeyboardProvider>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
