import { View } from 'tamagui';
import { SectionPrimitive } from '../SectionPrimitive';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('SectionPrimitive', () => {
  it('renders a title with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<SectionPrimitive title={{ i18nKey: 'profile:account.title' }} />);
    expect(getByText('[TR] profile:account.title')).toBeTruthy();
  });

  it('renders a title with a non-translatable text', async () => {
    const { getByText } = await renderWithTheme(<SectionPrimitive title={{ text: 'CUENTA' }} />);
    expect(getByText('CUENTA')).toBeTruthy();
  });

  it('renders a subtitle alongside the title', async () => {
    const { getByText } = await renderWithTheme(
      <SectionPrimitive title={{ text: 'Goals' }} subtitle={{ text: 'Track your progress' }} />
    );
    expect(getByText('Goals')).toBeTruthy();
    expect(getByText('Track your progress')).toBeTruthy();
  });

  it('renders no header when neither title nor action is given', async () => {
    const { queryByText } = await renderWithTheme(
      <SectionPrimitive>
        <View>{/* body-only usage */}</View>
      </SectionPrimitive>
    );
    expect(queryByText('CUENTA')).toBeNull();
  });

  it('renders an action node even without a title', async () => {
    const { getByTestId } = await renderWithTheme(<SectionPrimitive action={<View testID="action" />} />);
    expect(getByTestId('action')).toBeTruthy();
  });

  it('renders children below the header', async () => {
    const { getByTestId } = await renderWithTheme(
      <SectionPrimitive title={{ text: 'Section' }}>
        <View testID="body" />
      </SectionPrimitive>
    );
    expect(getByTestId('body')).toBeTruthy();
  });

  it('defaults size="section" to a small uppercase label', async () => {
    const { getByText } = await renderWithTheme(<SectionPrimitive title={{ text: 'cuenta' }} />);
    expect(getByText('cuenta').props.style.textTransform).toBe('uppercase');
  });

  it('applies size="screen" as a larger, non-uppercase title', async () => {
    const { getByText } = await renderWithTheme(<SectionPrimitive title={{ text: 'Goals' }} size="screen" />);
    expect(getByText('Goals').props.style.textTransform).toBeUndefined();
  });

  it('omits the divider by default', async () => {
    const { toJSON } = await renderWithTheme(<SectionPrimitive title={{ text: 'X' }} />);
    const json = JSON.stringify(toJSON());
    expect(json).not.toContain('"backgroundColor":"#E7E7EF"');
  });

  it('renders a divider when showDivider is true', async () => {
    const withDivider = await renderWithTheme(<SectionPrimitive title={{ text: 'X' }} showDivider />);
    const withoutDivider = await renderWithTheme(<SectionPrimitive title={{ text: 'X' }} />);
    const heightOneCount = (json: unknown) => (JSON.stringify(json).match(/"height":1[,}]/g) ?? []).length;
    expect(heightOneCount(withDivider.toJSON())).toBe(heightOneCount(withoutDivider.toJSON()) + 1);
  });

  it.each(['compact', 'default', 'spacious'] as const)('accepts spacing="%s" without throwing', async (spacing) => {
    const { getByText } = await renderWithTheme(<SectionPrimitive title={{ text: `sp-${spacing}` }} spacing={spacing} />);
    expect(getByText(`sp-${spacing}`)).toBeTruthy();
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <SectionPrimitive title={{ text: 'Goals' }} subtitle={{ text: 'Track your progress' }} size="screen" />,
      'sunrise'
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<SectionPrimitive title={{ text: 'CUENTA' }} />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<SectionPrimitive title={{ text: 'CUENTA' }} showDivider />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });
});
