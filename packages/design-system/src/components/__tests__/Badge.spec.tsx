import { View } from 'tamagui';
import { Badge } from '../Badge';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('Badge', () => {
  it('renders correctly with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<Badge i18nKey="commitments:status.active" />);
    expect(getByText('[TR] commitments:status.active')).toBeTruthy();
  });

  it('renders correctly with a non-translatable label', async () => {
    const { getByText } = await renderWithTheme(<Badge label="v2.0.1" />);
    expect(getByText('v2.0.1')).toBeTruthy();
  });

  it('renders iconStart', async () => {
    const { getByTestId } = await renderWithTheme(
      <Badge label="AI" iconStart={<View testID="start-icon" />} />
    );
    expect(getByTestId('start-icon')).toBeTruthy();
  });

  it('renders iconEnd', async () => {
    const { getByTestId } = await renderWithTheme(
      <Badge label="Premium" iconEnd={<View testID="end-icon" />} />
    );
    expect(getByTestId('end-icon')).toBeTruthy();
  });

  it('defaults to variant="filled"', async () => {
    const { getByText } = await renderWithTheme(<Badge label="Beta" tone="success" />);
    const node = getByText('Beta').parent;
    expect(node?.props.style.backgroundColor).not.toBe('transparent');
  });

  it('renders variant="outlined" with a transparent background', async () => {
    const { getByText } = await renderWithTheme(<Badge label="Beta" tone="success" variant="outlined" />);
    const node = getByText('Beta').parent;
    expect(node?.props.style.backgroundColor).toBe('transparent');
  });

  it('gives tone="neutral" a border even when filled (the Baja-priority visibility fix)', async () => {
    const { getByText } = await renderWithTheme(<Badge label="Baja" tone="neutral" />);
    const node = getByText('Baja').parent;
    expect(node?.props.style.borderTopWidth).toBe(1);
  });

  it.each(['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const)(
    'accepts tone="%s" without throwing',
    async (tone) => {
      const { getByText } = await renderWithTheme(<Badge label={`tone-${tone}`} tone={tone} />);
      expect(getByText(`tone-${tone}`)).toBeTruthy();
    }
  );

  it('applies size="small"', async () => {
    const { getByText } = await renderWithTheme(<Badge label="Small" size="small" />);
    const node = getByText('Small').parent;
    expect(node?.props.style.height).toBe(20);
  });

  it('applies size="large"', async () => {
    const { getByText } = await renderWithTheme(<Badge label="Large" size="large" />);
    const node = getByText('Large').parent;
    expect(node?.props.style.height).toBe(28);
  });

  it('defaults the accessible name to the resolved badge text', async () => {
    const { getByText } = await renderWithTheme(<Badge label="Offline" />);
    const node = getByText('Offline').parent;
    expect(node?.props.accessibilityLabel).toBe('Offline');
  });

  it('overrides the accessible name via accessibilityLabelI18nKey', async () => {
    const { getByText } = await renderWithTheme(
      <Badge label="AI" accessibilityLabelI18nKey="badges:ai.a11yLabel" />
    );
    const node = getByText('AI').parent;
    expect(node?.props.accessibilityLabel).toBe('[TR] badges:ai.a11yLabel');
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Badge i18nKey="commitments:status.active" tone="success" />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Badge i18nKey="commitments:status.active" tone="success" />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Badge i18nKey="commitments:status.active" tone="success" />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });
});
