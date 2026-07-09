

import { Switch } from '../Switch';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
}));

describe('Switch', () => {
  it('renders correctly', () => {
    const { getByText, getByRole } = renderWithTheme(
      <Switch checked={false} onCheckedChange={() => {}} labelI18nKey="settings.notifications" />
    );
    expect(getByText('[TR] settings.notifications')).toBeTruthy();
    expect(getByRole('switch').props.accessibilityState.checked).toBe(false);
  });

  it('matches sunrise theme snapshot', () => {
    const { toJSON } = renderWithTheme(<Switch checked={true} onCheckedChange={() => {}} />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', () => {
    const { toJSON } = renderWithTheme(<Switch checked={false} onCheckedChange={() => {}} />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', () => {
    const { toJSON } = renderWithTheme(<Switch checked={true} onCheckedChange={() => {}} disabled />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });
});
