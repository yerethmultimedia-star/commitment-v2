import { View } from 'tamagui';
import { fireEvent } from '@testing-library/react-native';
import { MetricCard } from '../MetricCard';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('MetricCard', () => {
  it('renders value and label with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<MetricCard value={12} i18nKey="goals:count" />);
    expect(getByText('12')).toBeTruthy();
    expect(getByText('[TR] goals:count')).toBeTruthy();
  });

  it('renders value and label with a non-translatable label', async () => {
    const { getByText } = await renderWithTheme(<MetricCard value="84%" label="Completion" />);
    expect(getByText('84%')).toBeTruthy();
    expect(getByText('Completion')).toBeTruthy();
  });

  it('renders a numeric value', async () => {
    const { getByText } = await renderWithTheme(<MetricCard value={7} label="Habits" />);
    expect(getByText('7')).toBeTruthy();
  });

  it('renders an optional icon', async () => {
    const { getByTestId } = await renderWithTheme(
      <MetricCard value={3} label="Tasks" icon={<View testID="metric-icon" />} />
    );
    expect(getByTestId('metric-icon')).toBeTruthy();
  });

  it.each(['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const)(
    'accepts tone="%s" without throwing',
    async (tone) => {
      const { getByText } = await renderWithTheme(<MetricCard value={1} label={`tone-${tone}`} tone={tone} />);
      expect(getByText(`tone-${tone}`)).toBeTruthy();
    }
  );

  it('is not clickable without onPress', async () => {
    const { queryByRole } = await renderWithTheme(<MetricCard value={1} label="Static" />);
    expect(queryByRole('button')).toBeNull();
  });

  it('becomes clickable and fires onPress', async () => {
    const onPress = jest.fn();
    const { getByRole } = await renderWithTheme(<MetricCard value={1} label="Clickable" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<MetricCard value={12} label="Goals" tone="accent" />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<MetricCard value={12} label="Goals" tone="accent" />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<MetricCard value={12} label="Goals" tone="accent" />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });
});
