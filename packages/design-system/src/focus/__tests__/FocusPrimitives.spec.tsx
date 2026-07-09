import { useRef } from 'react';
import { useInitialFocus, useRestoreFocus, useFocusTrap, useRovingFocus } from '../index.js';
import { renderWithTheme } from '../../components/__tests__/setup.js';
import { View } from 'tamagui';

const FocusTestComponent = () => {
  const initialRef = useRef<any>(null);
  const restoreRef = useRef<any>(null);
  const trapRef = useRef<any>(null);

  useInitialFocus(initialRef, true);
  useRestoreFocus(restoreRef, true);
  useFocusTrap(trapRef, true);
  
  const { getTabIndex, handleKeyPress } = useRovingFocus(3);

  return (
    <View ref={trapRef}>
      <View ref={initialRef} tabIndex={0} />
      <View ref={restoreRef} tabIndex={0} />
      <View tabIndex={getTabIndex(0)} onKeyDown={(e) => handleKeyPress(0, e)} />
      <View tabIndex={getTabIndex(1)} onKeyDown={(e) => handleKeyPress(1, e)} />
    </View>
  );
};

describe('Focus Primitives', () => {
  it('registers and pushes context stack', () => {
    const { toJSON } = renderWithTheme(<FocusTestComponent />);
    expect(toJSON()).toMatchSnapshot();
  });
});
