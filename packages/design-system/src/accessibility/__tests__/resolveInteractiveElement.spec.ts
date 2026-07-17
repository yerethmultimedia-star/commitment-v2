import { resolveInteractiveElement, resolveFocusVisibleStyle } from '../resolveInteractiveElement.js';

describe('resolveInteractiveElement', () => {
  it('never resolves accessibilityRole="button" to a non-focusable element (TD-015 invariant)', () => {
    expect(resolveInteractiveElement('button')).toBe('button');
  });

  it('resolves simple activate-on-press roles to a real <button>', () => {
    expect(resolveInteractiveElement('tab')).toBe('button');
    expect(resolveInteractiveElement('checkbox')).toBe('button');
    expect(resolveInteractiveElement('switch')).toBe('button');
  });

  it('resolves link to <a>, not <button>', () => {
    expect(resolveInteractiveElement('link')).toBe('a');
  });

  it('does not force composite-widget roles onto <button> (roving-tabindex pattern, not a fit here)', () => {
    expect(resolveInteractiveElement('menuitem')).toBeNull();
    expect(resolveInteractiveElement('treeitem')).toBeNull();
    expect(resolveInteractiveElement('option')).toBeNull();
  });

  it('leaves structural/descriptive roles unmapped', () => {
    expect(resolveInteractiveElement('text')).toBeNull();
    expect(resolveInteractiveElement('header')).toBeNull();
    expect(resolveInteractiveElement('tablist')).toBeNull();
    expect(resolveInteractiveElement('progressbar')).toBeNull();
  });

  it('defaults unknown or missing roles to null rather than guessing', () => {
    expect(resolveInteractiveElement(undefined)).toBeNull();
    expect(resolveInteractiveElement('some-future-role')).toBeNull();
  });
});

describe('resolveFocusVisibleStyle', () => {
  it('supplies a focus-visible outline for a resolved element, on the $focus token', () => {
    expect(resolveFocusVisibleStyle('button')).toEqual({
      outlineColor: '$focus',
      outlineStyle: 'solid',
      outlineWidth: 2,
      outlineOffset: 2,
    });
    expect(resolveFocusVisibleStyle('a')).toEqual({
      outlineColor: '$focus',
      outlineStyle: 'solid',
      outlineWidth: 2,
      outlineOffset: 2,
    });
  });

  it('supplies nothing when there is no resolved element (non-interactive role)', () => {
    expect(resolveFocusVisibleStyle(null)).toBeUndefined();
  });
});
