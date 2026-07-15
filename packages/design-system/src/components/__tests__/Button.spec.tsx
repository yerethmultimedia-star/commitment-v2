
import { fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('Button', () => {
  it('renders correctly', async () => {
    const { getByText } = await renderWithTheme(<Button i18nKey="common.save" />);
    expect(getByText('[TR] common.save')).toBeTruthy();
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Button i18nKey="common.save" />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Button i18nKey="common.save" />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Button i18nKey="common.save" />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles onPress', async () => {
    const onPress = jest.fn();
    const { getByRole } = await renderWithTheme(<Button i18nKey="common.save" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('is inaccessible when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await renderWithTheme(<Button i18nKey="common.save" disabled onPress={onPress} />);
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading state correctly', async () => {
    const { getByRole } = await renderWithTheme(<Button i18nKey="common.save" loading />);
    const button = getByRole('button');
    expect(button.props.accessibilityState.busy).toBe(true);
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
