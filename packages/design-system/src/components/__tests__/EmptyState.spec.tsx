import { View } from 'tamagui';
import { EmptyState } from '../EmptyState';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('EmptyState', () => {
  it('renders a title with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<EmptyState title={{ i18nKey: 'goals:empty.title' }} />);
    expect(getByText('[TR] goals:empty.title')).toBeTruthy();
  });

  it('renders a title and description with plain text', async () => {
    const { getByText } = await renderWithTheme(
      <EmptyState title={{ text: 'No goals yet' }} description={{ text: 'Create your first goal' }} />
    );
    expect(getByText('No goals yet')).toBeTruthy();
    expect(getByText('Create your first goal')).toBeTruthy();
  });

  it('renders an illustration', async () => {
    const { getByTestId } = await renderWithTheme(
      <EmptyState illustration={<View testID="illustration" />} title={{ text: 'X' }} />
    );
    expect(getByTestId('illustration')).toBeTruthy();
  });

  it('renders a primary action', async () => {
    const { getByTestId } = await renderWithTheme(
      <EmptyState title={{ text: 'X' }} primaryAction={<View testID="cta" />} />
    );
    expect(getByTestId('cta')).toBeTruthy();
  });

  it('defaults to fullscreen=true', async () => {
    const { getByTestId } = await renderWithTheme(<EmptyState testID="root" title={{ text: 'X' }} />);
    expect(getByTestId('root').props.style.flex).toBe(1);
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <EmptyState title={{ text: 'No goals yet' }} description={{ text: 'Create your first goal' }} />,
      'sunrise'
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
