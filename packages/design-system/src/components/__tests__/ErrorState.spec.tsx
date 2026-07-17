import { View } from 'tamagui';
import { ErrorState } from '../ErrorState';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('ErrorState', () => {
  it('renders a title with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<ErrorState title={{ i18nKey: 'common:error.title' }} />);
    expect(getByText('[TR] common:error.title')).toBeTruthy();
  });

  it('renders the title in the danger tone by default', async () => {
    const { getByText } = await renderWithTheme(<ErrorState title={{ text: 'Something went wrong' }} />);
    expect(getByText('Something went wrong').props.style.color).toBeDefined();
  });

  it('renders a retry action', async () => {
    const { getByTestId } = await renderWithTheme(
      <ErrorState title={{ text: 'X' }} primaryAction={<View testID="retry" />} />
    );
    expect(getByTestId('retry')).toBeTruthy();
  });

  it('defaults to fullscreen=true', async () => {
    const { getByTestId } = await renderWithTheme(<ErrorState testID="root" title={{ text: 'X' }} />);
    expect(getByTestId('root').props.style.flex).toBe(1);
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<ErrorState title={{ text: 'Something went wrong' }} />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });
});
