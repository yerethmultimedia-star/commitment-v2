import { View } from 'tamagui';
import { fireEvent } from '@testing-library/react-native';
import { StatCard } from '../StatCard';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('StatCard', () => {
  it('renders value and title with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<StatCard value={84} i18nKey="insights:productivity" />);
    expect(getByText('84')).toBeTruthy();
    expect(getByText('[TR] insights:productivity')).toBeTruthy();
  });

  it('renders value and title with a non-translatable label', async () => {
    const { getByText } = await renderWithTheme(<StatCard value="45 min" label="Avg. focus" />);
    expect(getByText('45 min')).toBeTruthy();
    expect(getByText('Avg. focus')).toBeTruthy();
  });

  it('renders without a delta when deltaLabel is omitted', async () => {
    const { queryByText } = await renderWithTheme(<StatCard value={10} label="Tasks" />);
    expect(queryByText(/vs/i)).toBeNull();
  });

  it('renders a positive delta in the success color', async () => {
    const { getByText } = await renderWithTheme(
      <StatCard value={10} label="Tasks" deltaLabel="+3 vs last week" deltaTone="positive" />
    );
    const node = getByText('+3 vs last week');
    expect(node.props.style.color).toBeDefined();
  });

  it('renders a negative delta', async () => {
    const { getByText } = await renderWithTheme(
      <StatCard value={10} label="Tasks" deltaLabel="-2 vs last week" deltaTone="negative" />
    );
    expect(getByText('-2 vs last week')).toBeTruthy();
  });

  it('renders a caller-supplied visual slot', async () => {
    const { getByTestId } = await renderWithTheme(
      <StatCard value={10} label="Tasks" visual={<View testID="sparkline-slot" />} />
    );
    expect(getByTestId('sparkline-slot')).toBeTruthy();
  });

  it('is not clickable without onPress', async () => {
    const { queryByRole } = await renderWithTheme(<StatCard value={1} label="Static" />);
    expect(queryByRole('button')).toBeNull();
  });

  it('becomes clickable and fires onPress', async () => {
    const onPress = jest.fn();
    const { getByRole } = await renderWithTheme(<StatCard value={1} label="Clickable" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <StatCard value={84} label="Productivity" deltaLabel="+12%" deltaTone="positive" />,
      'sunrise'
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <StatCard value={84} label="Productivity" deltaLabel="+12%" deltaTone="positive" />,
      'midnight'
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <StatCard value={84} label="Productivity" deltaLabel="+12%" deltaTone="positive" />,
      'forest'
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
