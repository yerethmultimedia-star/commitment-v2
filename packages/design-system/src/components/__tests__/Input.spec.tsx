
import { fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('Input', () => {
  it('renders correctly with labels and helpers', async () => {
    const { getByText } = await renderWithTheme(
      <Input value="" onChangeText={() => {}} labelI18nKey="form.label" helperI18nKey="form.helper" />
    );
    expect(getByText('[TR] form.label')).toBeTruthy();
    expect(getByText('[TR] form.helper')).toBeTruthy();
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Input value="Hello" onChangeText={() => {}} />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Input value="Hello" onChangeText={() => {}} error />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Input value="Hello" onChangeText={() => {}} success />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles onChangeText', async () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = await renderWithTheme(<Input value="Hi" onChangeText={onChangeText} />);
    fireEvent.changeText(getByDisplayValue('Hi'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('handles parsers and formatters', async () => {
    const onChangeText = jest.fn();
    const formatter = (text: string) => text.toUpperCase();
    const parser = (text: string) => text.trim();
    
    const { getByDisplayValue } = await renderWithTheme(
      <Input value="hi" onChangeText={onChangeText} formatter={formatter} parser={parser} />
    );
    fireEvent.changeText(getByDisplayValue('hi'), ' hello ');
    expect(onChangeText).toHaveBeenCalledWith('HELLO');
  });
});
