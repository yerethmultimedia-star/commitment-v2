import { View } from 'tamagui';
import { SectionHeader } from '../SectionHeader';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('SectionHeader', () => {
  it('renders the title and subtitle', async () => {
    const { getByText } = await renderWithTheme(
      <SectionHeader title={{ text: 'Goals' }} subtitle={{ text: 'Track your progress' }} />
    );
    expect(getByText('Goals')).toBeTruthy();
    expect(getByText('Track your progress')).toBeTruthy();
  });

  it('renders an action', async () => {
    const { getByTestId } = await renderWithTheme(
      <SectionHeader title={{ text: 'Goals' }} action={<View testID="action" />} />
    );
    expect(getByTestId('action')).toBeTruthy();
  });

  it('defaults to size="screen" (non-uppercase title)', async () => {
    const { getByText } = await renderWithTheme(<SectionHeader title={{ text: 'Goals' }} />);
    expect(getByText('Goals').props.style.textTransform).toBeUndefined();
  });

  it('can be forced to size="section"', async () => {
    const { getByText } = await renderWithTheme(<SectionHeader title={{ text: 'cuenta' }} size="section" />);
    expect(getByText('cuenta').props.style.textTransform).toBe('uppercase');
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <SectionHeader title={{ text: 'Goals' }} subtitle={{ text: 'Track your progress' }} />,
      'sunrise'
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
