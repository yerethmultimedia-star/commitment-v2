
import { Portal, PortalProvider } from '../index.js';
import { renderWithTheme } from '../../components/__tests__/setup.js';
import { Text } from 'tamagui';

describe('Portal Primitive', () => {
  it('renders children inside host', () => {
    const { toJSON, getByText } = renderWithTheme(
      <PortalProvider>
        <Portal>
          <Text>Inside Portal</Text>
        </Portal>
      </PortalProvider>
    );

    expect(getByText('Inside Portal')).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });
});
