import { readFileSync } from 'fs';

// Not a snapshot, not a rendered-DOM assertion — this repo's test suite runs
// under the RN jest preset (React Native's own renderer), so there is no
// real browser DOM/CSS cascade to call `getComputedStyle` against here (the
// actual "border is gone, focus ring is visible" behavior was verified live
// against the running app via Playwright — see TECH_DEBT.md TD-015). What
// IS mechanically testable, and worth protecting, is the contract this
// fix depends on: `@tamagui/core/reset.css` must still neutralize native
// `<button>` chrome the way it did when this was verified. If a future
// Tamagui upgrade changes or removes that rule, this fails loudly instead
// of the border silently coming back.
describe('@tamagui/core/reset.css contract (TD-015 follow-up)', () => {
  it('still resets <button> (and friends) with `all: unset`', () => {
    const resetCssPath = require.resolve('@tamagui/core/reset.css');
    const css = readFileSync(resetCssPath, 'utf-8');

    // The exact selector list may shift between Tamagui versions; what must
    // not regress is that `button` is one of the tags reset with `all: unset`.
    const buttonResetRule = css
      .split('}')
      .find((rule) => /(^|[,\s])button([,\s{]|$)/.test(rule) && rule.includes('all: unset'));

    expect(buttonResetRule).toBeDefined();
  });
});
