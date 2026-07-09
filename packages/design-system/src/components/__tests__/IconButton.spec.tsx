
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'tamagui';
import { IconButton } from '../IconButton';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
}));

describe('IconButton', () => {
  it('renders correctly', () => {
    const { getByRole } = renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} tooltipI18nKey="common.edit" />);
    expect(getByRole('button').props.accessibilityLabel).toBe('[TR] common.edit');
  });

  it('matches sunrise theme snapshot', () => {
    const { toJSON } = renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', () => {
    const { toJSON } = renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', () => {
    const { toJSON } = renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles onPress and respects disabled state', () => {
    const onPress = jest.fn();
    const { getByRole, rerender } = renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<IconButton iconToken={<Text>Icon</Text>} onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1); // No new call
  });
});
