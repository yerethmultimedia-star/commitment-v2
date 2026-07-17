import { fireEvent } from '@testing-library/react-native';
import { DurationWheelPicker } from '../DurationWheelPicker';
import { renderWithTheme } from '../../components/__tests__/setup';

describe('DurationWheelPicker', () => {
  it('renders the current hours and minutes rows', async () => {
    const { getAllByText } = await renderWithTheme(
      <DurationWheelPicker hours={1} minutes={30} onChange={() => {}} />
    );
    expect(getAllByText('1').length).toBeGreaterThan(0);
    expect(getAllByText('30').length).toBeGreaterThan(0);
  });

  it('calls onChange with the tapped hour value', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <DurationWheelPicker hours={0} minutes={0} onChange={onChange} />
    );
    fireEvent.press(getByLabelText('2'));
    expect(onChange).toHaveBeenCalledWith({ hours: 2, minutes: 0 });
  });

  it('calls onChange with the tapped minute value', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <DurationWheelPicker hours={0} minutes={0} onChange={onChange} />
    );
    fireEvent.press(getByLabelText('15'));
    expect(onChange).toHaveBeenCalledWith({ hours: 0, minutes: 15 });
  });

  it('respects a custom maxHours/minuteStep range', async () => {
    const { queryByLabelText } = await renderWithTheme(
      <DurationWheelPicker hours={0} minutes={0} onChange={() => {}} maxHours={2} minuteStep={30} />
    );
    expect(queryByLabelText('3')).toBeNull();
    expect(queryByLabelText('45')).toBeNull();
  });

  it('uses custom hoursLabel/minutesLabel text', async () => {
    const { getByText } = await renderWithTheme(
      <DurationWheelPicker hours={0} minutes={0} onChange={() => {}} hoursLabel="Horas" minutesLabel="Min" />
    );
    expect(getByText('Horas')).toBeTruthy();
    expect(getByText('Min')).toBeTruthy();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <DurationWheelPicker hours={0} minutes={30} onChange={() => {}} />,
      'midnight'
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
