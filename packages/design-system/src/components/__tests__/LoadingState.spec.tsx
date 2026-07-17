import { View } from 'tamagui';
import { LoadingState } from '../LoadingState';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('LoadingState', () => {
  it('renders with no title/description (bare spinner)', async () => {
    const { toJSON } = await renderWithTheme(<LoadingState />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders an optional title', async () => {
    const { getByText } = await renderWithTheme(<LoadingState title={{ text: 'Loading your data...' }} />);
    expect(getByText('Loading your data...')).toBeTruthy();
  });

  it('accepts a custom icon instead of the default spinner', async () => {
    const { getByTestId } = await renderWithTheme(<LoadingState icon={<View testID="custom-icon" />} />);
    expect(getByTestId('custom-icon')).toBeTruthy();
  });

  it('defaults to fullscreen=true', async () => {
    const { getByTestId } = await renderWithTheme(<LoadingState testID="root" />);
    expect(getByTestId('root').props.style.flex).toBe(1);
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<LoadingState title={{ text: 'Loading...' }} />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });
});
