import { Text } from 'tamagui';
import { SettingsSection } from '../SettingsSection';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('SettingsSection', () => {
  it('renders the title', async () => {
    const { getByText } = await renderWithTheme(<SettingsSection title={{ text: 'Cuenta' }} />);
    expect(getByText('Cuenta')).toBeTruthy();
  });

  it('wraps each child row and adds a divider between rows, none on the first', async () => {
    const { getByTestId } = await renderWithTheme(
      <SettingsSection title={{ text: 'Cuenta' }}>
        <Text testID="row-1">Preferencias</Text>
        <Text testID="row-2">Notificaciones</Text>
      </SettingsSection>
    );
    const row1Wrapper = getByTestId('row-1').parent;
    const row2Wrapper = getByTestId('row-2').parent;
    expect(row1Wrapper?.props.style.borderTopWidth).toBe(0);
    expect(row2Wrapper?.props.style.borderTopWidth).toBe(1);
  });

  it('renders a single row with no divider', async () => {
    const { getByTestId } = await renderWithTheme(
      <SettingsSection title={{ text: 'Cuenta' }}>
        <Text testID="only-row">Preferencias</Text>
      </SettingsSection>
    );
    expect(getByTestId('only-row').parent?.props.style.borderTopWidth).toBe(0);
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <SettingsSection title={{ text: 'Cuenta' }}>
        <Text>Preferencias</Text>
        <Text>Notificaciones</Text>
      </SettingsSection>,
      'sunrise'
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
