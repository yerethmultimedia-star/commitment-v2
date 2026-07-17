import { ProgressMetric } from '../ProgressMetric';
import { renderWithTheme } from './setup';

jest.mock('@commitment/localization', () => ({
  t: (key: string) => `[TR] ${key}`,
  useTranslation: () => ({ t: (key: string) => `[TR] ${key}` }),
}));

describe('ProgressMetric', () => {
  it('renders the computed percentage by default (circular)', async () => {
    const { getByText } = await renderWithTheme(<ProgressMetric progress={0.72} />);
    expect(getByText('72%')).toBeTruthy();
  });

  it('renders the computed percentage for the linear variant', async () => {
    const { getByText } = await renderWithTheme(<ProgressMetric progress={0.5} variant="linear" />);
    expect(getByText('50%')).toBeTruthy();
  });

  it('clamps progress above 1', async () => {
    const { getByText } = await renderWithTheme(<ProgressMetric progress={1.4} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('clamps progress below 0', async () => {
    const { getByText } = await renderWithTheme(<ProgressMetric progress={-0.3} />);
    expect(getByText('0%')).toBeTruthy();
  });

  it('hides the percentage when showPercentage=false', async () => {
    const { queryByText } = await renderWithTheme(<ProgressMetric progress={0.72} showPercentage={false} />);
    expect(queryByText('72%')).toBeNull();
  });

  it('renders only the percentage when neither i18nKey nor label is given', async () => {
    const { getByText, queryByText } = await renderWithTheme(<ProgressMetric progress={0.5} />);
    expect(getByText('50%')).toBeTruthy();
    expect(queryByText('undefined')).toBeNull();
  });

  it('renders a label with i18nKey', async () => {
    const { getByText } = await renderWithTheme(<ProgressMetric progress={0.5} i18nKey="goals:weeklyProgress" />);
    expect(getByText('[TR] goals:weeklyProgress')).toBeTruthy();
  });

  it('renders a label with a non-translatable label', async () => {
    const { getByText } = await renderWithTheme(<ProgressMetric progress={0.5} label="Weekly Goal" />);
    expect(getByText('Weekly Goal')).toBeTruthy();
  });

  it.each(['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const)(
    'accepts tone="%s" without throwing',
    async (tone) => {
      const { getByText } = await renderWithTheme(<ProgressMetric progress={0.5} tone={tone} label={`tone-${tone}`} />);
      expect(getByText(`tone-${tone}`)).toBeTruthy();
    }
  );

  it('applies size="small" (circular)', async () => {
    const { toJSON } = await renderWithTheme(<ProgressMetric progress={0.5} size="small" />);
    expect(toJSON()).toBeTruthy();
  });

  it('applies size="large" (circular)', async () => {
    const { toJSON } = await renderWithTheme(<ProgressMetric progress={0.5} size="large" />);
    expect(toJSON()).toBeTruthy();
  });

  it('matches circular sunrise theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<ProgressMetric progress={0.72} tone="accent" label="Weekly Goal" />, 'sunrise');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches circular midnight theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(<ProgressMetric progress={0.72} tone="accent" label="Weekly Goal" />, 'midnight');
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches linear forest theme snapshot', async () => {
    const { toJSON } = await renderWithTheme(
      <ProgressMetric progress={0.72} variant="linear" tone="success" label="Weekly Goal" />,
      'forest'
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
