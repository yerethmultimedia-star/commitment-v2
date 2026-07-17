import { View } from 'tamagui';
import { StatusIndicator } from '../StatusIndicator';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('StatusIndicator', () => {
  it('renders correctly with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator i18nKey="common:status.online" />);
    expect(getByText('[TR] common:status.online')).toBeTruthy();
  });

  it('renders correctly with a non-translatable label', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator label="Synced" />);
    expect(getByText('Synced')).toBeTruthy();
  });

  it('shows a dot by default (one more child than showDot=false + icon)', async () => {
    const withDot = await renderWithTheme(<StatusIndicator label="Online" tone="success" icon={<View testID="i" />} />);
    const withoutDot = await renderWithTheme(<StatusIndicator label="Online" tone="success" showDot={false} icon={<View testID="i" />} />);
    const dotChildren = withDot.getByText('Online').parent?.children.length ?? 0;
    const noDotChildren = withoutDot.getByText('Online').parent?.children.length ?? 0;
    expect(dotChildren).toBe(noDotChildren + 1);
  });

  it('omits the dot when showDot=false', async () => {
    const { queryAllByTestId } = await renderWithTheme(
      <StatusIndicator label="Offline" showDot={false} icon={<View testID="only-icon" />} />
    );
    expect(queryAllByTestId('only-icon').length).toBe(1);
  });

  it('renders a custom icon', async () => {
    const { getByTestId } = await renderWithTheme(
      <StatusIndicator label="Failed" tone="danger" icon={<View testID="status-icon" />} />
    );
    expect(getByTestId('status-icon')).toBeTruthy();
  });

  it.each(['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const)(
    'accepts tone="%s" without throwing',
    async (tone) => {
      const { getByText } = await renderWithTheme(<StatusIndicator label={`tone-${tone}`} tone={tone} />);
      expect(getByText(`tone-${tone}`)).toBeTruthy();
    }
  );

  it('defaults to orientation="horizontal" (row layout)', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator label="Online" />);
    expect(getByText('Online').parent?.props.style.flexDirection).toBe('row');
  });

  it('applies orientation="vertical" (column layout)', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator label="Online" orientation="vertical" />);
    expect(getByText('Online').parent?.props.style.flexDirection).toBe('column');
  });

  it('applies truncate as a single line with ellipsis', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator label="A very long status message" truncate />);
    const textNode = getByText('A very long status message');
    expect(textNode.props.numberOfLines).toBe(1);
  });

  it('applies size="small"', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator label="Small" size="small" />);
    expect(getByText('Small').props.style.fontSize).toBe(10);
  });

  it('applies size="large"', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator label="Large" size="large" />);
    expect(getByText('Large').props.style.fontSize).toBe(13);
  });

  it('defaults the accessible name to the resolved text', async () => {
    const { getByText } = await renderWithTheme(<StatusIndicator label="Pending" />);
    const node = getByText('Pending').parent;
    expect(node?.props.accessibilityLabel).toBe('Pending');
  });

  it('overrides the accessible name via accessibilityLabelI18nKey', async () => {
    const { getByText } = await renderWithTheme(
      <StatusIndicator label="Online" accessibilityLabelI18nKey="status:onlineA11y" />
    );
    const node = getByText('Online').parent;
    expect(node?.props.accessibilityLabel).toBe('[TR] status:onlineA11y');
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<StatusIndicator label="Online" tone="success" />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<StatusIndicator label="Online" tone="success" />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<StatusIndicator label="Online" tone="success" />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });
});
