
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'tamagui';
import { IconButton } from '../IconButton';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
}));

describe('IconButton', () => {
  it('renders correctly', async () => {
    const { getByRole } = await renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} tooltipI18nKey="common.edit" />);
    expect(getByRole('button').props.accessibilityLabel).toBe('[TR] common.edit');
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles onPress and respects disabled state', async () => {
    const onPress = jest.fn();
    const { getByRole, rerender } = await renderWithTheme(<IconButton iconToken={<Text>Icon</Text>} onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(<IconButton iconToken={<Text>Icon</Text>} onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1); // No new call
  });
});
