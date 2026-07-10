

import { Switch } from '../Switch';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
}));

describe('Switch', () => {
  it('renders correctly', async () => {
    const { getByText, getByRole } = await renderWithTheme(
      <Switch checked={false} onCheckedChange={() => {}} labelI18nKey="settings.notifications" />
    );
    expect(getByText('[TR] settings.notifications')).toBeTruthy();
    expect(getByRole('switch').props.accessibilityState.checked).toBe(false);
  });

  it('matches sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Switch checked={true} onCheckedChange={() => {}} />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Switch checked={false} onCheckedChange={() => {}} />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<Switch checked={true} onCheckedChange={() => {}} disabled />, 'forest');
    expect(toJSON()).toMatchSnapshot();
  });
});
