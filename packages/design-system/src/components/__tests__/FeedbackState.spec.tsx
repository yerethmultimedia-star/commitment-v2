import { View } from 'tamagui';
import { FeedbackState } from '../FeedbackState';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('FeedbackState', () => {
  it('renders a title with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<FeedbackState title={{ i18nKey: 'common:empty.title' }} />);
    expect(getByText('[TR] common:empty.title')).toBeTruthy();
  });

  it('renders a title and description with plain text', async () => {
    const { getByText } = await renderWithTheme(
      <FeedbackState title={{ text: 'Nothing here yet' }} description={{ text: 'Add your first item' }} />
    );
    expect(getByText('Nothing here yet')).toBeTruthy();
    expect(getByText('Add your first item')).toBeTruthy();
  });

  it('renders no description when omitted', async () => {
    const { queryByText } = await renderWithTheme(<FeedbackState title={{ text: 'X' }} />);
    expect(queryByText('Add your first item')).toBeNull();
  });

  it('renders an icon', async () => {
    const { getByTestId } = await renderWithTheme(<FeedbackState icon={<View testID="icon" />} title={{ text: 'X' }} />);
    expect(getByTestId('icon')).toBeTruthy();
  });

  it('renders an illustration', async () => {
    const { getByTestId } = await renderWithTheme(
      <FeedbackState illustration={<View testID="illustration" />} title={{ text: 'X' }} />
    );
    expect(getByTestId('illustration')).toBeTruthy();
  });

  it('renders a primary action', async () => {
    const { getByTestId } = await renderWithTheme(
      <FeedbackState title={{ text: 'X' }} primaryAction={<View testID="primary" />} />
    );
    expect(getByTestId('primary')).toBeTruthy();
  });

  it('renders both primary and secondary actions', async () => {
    const { getByTestId } = await renderWithTheme(
      <FeedbackState title={{ text: 'X' }} primaryAction={<View testID="primary" />} secondaryAction={<View testID="secondary" />} />
    );
    expect(getByTestId('primary')).toBeTruthy();
    expect(getByTestId('secondary')).toBeTruthy();
  });

  it('applies tone="danger" to the title color', async () => {
    const { getByText } = await renderWithTheme(<FeedbackState title={{ text: 'Error' }} tone="danger" />);
    expect(getByText('Error').props.style.color).toBeDefined();
  });

  it.each(['compact', 'default', 'spacious'] as const)('accepts spacing="%s" without throwing', async (spacing) => {
    const { getByText } = await renderWithTheme(<FeedbackState title={{ text: `sp-${spacing}` }} spacing={spacing} />);
    expect(getByText(`sp-${spacing}`)).toBeTruthy();
  });

  it('defaults fullscreen to false (no flex:1)', async () => {
    const { getByTestId } = await renderWithTheme(<FeedbackState testID="root" title={{ text: 'X' }} />);
    expect(getByTestId('root').props.style.flex).toBeUndefined();
  });

  it('applies fullscreen=true (flex:1, centered)', async () => {
    const { getByTestId } = await renderWithTheme(<FeedbackState testID="root" title={{ text: 'X' }} fullscreen />);
    expect(getByTestId('root').props.style.flex).toBe(1);
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <FeedbackState title={{ text: 'Nothing here' }} description={{ text: 'Add your first item' }} fullscreen />,
      'sunrise'
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<FeedbackState title={{ text: 'Error' }} tone="danger" />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<FeedbackState title={{ text: 'X' }} spacing="compact" />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });
});
