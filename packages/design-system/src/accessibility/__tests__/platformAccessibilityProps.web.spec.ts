// Dedicated web-branch test: the rest of the suite runs under the RN jest
// preset (Platform.OS === 'ios'), so it never exercises the web branch this
// file targets. Functional assertions on the actual computed props (not
// snapshots) — see TD-015: what matters is whether `render`/`tabIndex`
// come out right, not what a serialized tree looks like.
jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import { toPlatformAccessibilityProps } from '../platformAccessibilityProps.js';

describe('toPlatformAccessibilityProps — web branch (TD-015)', () => {
  it('renders a real <button> and is tabbable for accessibilityRole="button"', () => {
    const out = toPlatformAccessibilityProps({ accessibilityRole: 'button' });
    expect(out.render).toBe('button');
    expect(out.tabIndex).toBe(0);
    expect(out.role).toBe('button');
  });

  it('supplies a focus-visible outline, since reset.css strips the native one (TD-015 follow-up)', () => {
    const out = toPlatformAccessibilityProps({ accessibilityRole: 'button' });
    expect(out.focusVisibleStyle).toEqual({
      outlineColor: '$focus',
      outlineStyle: 'solid',
      outlineWidth: 2,
      outlineOffset: 2,
    });
  });

  it('does not supply a focus-visible outline for a disabled element', () => {
    const out = toPlatformAccessibilityProps({
      accessibilityRole: 'button',
      accessibilityState: { disabled: true },
    });
    expect(out.focusVisibleStyle).toBeUndefined();
  });

  it('renders a real <button> for tab/checkbox/switch roles, keeping their own ARIA role', () => {
    for (const role of ['tab', 'checkbox', 'switch']) {
      const out = toPlatformAccessibilityProps({ accessibilityRole: role });
      expect(out.render).toBe('button');
      expect(out.tabIndex).toBe(0);
      expect(out.role).toBe(role);
    }
  });

  it('never makes a disabled element a Tab stop', () => {
    const out = toPlatformAccessibilityProps({
      accessibilityRole: 'button',
      accessibilityState: { disabled: true },
    });
    expect(out.render).toBeUndefined();
    expect(out.tabIndex).toBeUndefined();
    expect(out['aria-disabled']).toBe(true);
  });

  it('does not add render/tabIndex for non-interactive roles', () => {
    const textOut = toPlatformAccessibilityProps({ accessibilityRole: 'text' });
    expect(textOut.render).toBeUndefined();
    expect(textOut.tabIndex).toBeUndefined();

    const headerOut = toPlatformAccessibilityProps({ accessibilityRole: 'header' });
    expect(headerOut.render).toBeUndefined();
    expect(headerOut.tabIndex).toBeUndefined();
  });

  it('does not add render/tabIndex when there is no accessibilityRole at all', () => {
    const out = toPlatformAccessibilityProps({ accessibilityLabel: 'just a label' });
    expect(out.render).toBeUndefined();
    expect(out.tabIndex).toBeUndefined();
  });
});
