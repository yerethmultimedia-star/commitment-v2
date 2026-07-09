
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'tamagui';
import { Card } from '../Card';
import { renderWithTheme } from './setup';

describe('Card', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithTheme(
      <Card>
        <Text>Content</Text>
      </Card>
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('matches sunrise theme snapshot', () => {
    const { toJSON } = renderWithTheme(<Card variant="elevated"><Text>Hi</Text></Card>, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', () => {
    const { toJSON } = renderWithTheme(<Card variant="outlined"><Text>Hi</Text></Card>, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', () => {
    const { toJSON } = renderWithTheme(<Card variant="flat"><Text>Hi</Text></Card>, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles clickable state', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Card clickable onPress={onPress}>
        <Text>Content</Text>
      </Card>
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
