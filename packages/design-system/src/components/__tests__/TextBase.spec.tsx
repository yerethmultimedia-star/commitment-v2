import { Body, Headline, Title, Caption } from '../typography';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string, params?: any) => `[TR] ${key}${params ? ' ' + JSON.stringify(params) : ''}`,
  useTranslation: () => ({ t: (key: string, params?: any) => `[TR] ${key}${params ? ' ' + JSON.stringify(params) : ''}` }),
}));

describe('Typography Primitives', () => {
  it('renders correctly with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<Body i18nKey="test.key" />);
    expect(getByText('[TR] test.key')).toBeTruthy();
  });

  it('renders correctly with children', async () => {
    const { getByText } = await renderWithTheme(<Headline>Raw Text</Headline>);
    expect(getByText('Raw Text')).toBeTruthy();
  });

  it('applies semantic roles correctly', async () => {
    const { toJSON } = await renderWithTheme(<Title i18nKey="test" />);
    // Snapshot will capture the font size, etc.
    expect(toJSON()).toMatchSnapshot();
  });

  it('applies tone correctly', async () => {
    const { toJSON } = await renderWithTheme(<Caption tone="danger">Error</Caption>);
    expect(toJSON()).toMatchSnapshot();
  });
});
