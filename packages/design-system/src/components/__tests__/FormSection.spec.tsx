import { View } from 'tamagui';
import { FormSection } from '../FormSection';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('FormSection', () => {
  it('renders the title', async () => {
    const { getByText } = await renderWithTheme(<FormSection title={{ text: 'Details' }} />);
    expect(getByText('Details')).toBeTruthy();
  });

  it('defaults to size="section" (uppercase title)', async () => {
    const { getByText } = await renderWithTheme(<FormSection title={{ text: 'details' }} />);
    expect(getByText('details').props.style.textTransform).toBe('uppercase');
  });

  it('renders children as a plain stack (no Card wrapper)', async () => {
    const { getByTestId } = await renderWithTheme(
      <FormSection title={{ text: 'Details' }}>
        <View testID="field-1" />
        <View testID="field-2" />
      </FormSection>
    );
    expect(getByTestId('field-1')).toBeTruthy();
    expect(getByTestId('field-2')).toBeTruthy();
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <FormSection title={{ text: 'Details' }}>
        <View />
      </FormSection>,
      'sunrise'
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
