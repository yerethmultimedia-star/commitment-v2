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
  
  const { getTabIndex, handleKeyDown } = useRovingFocus({ itemCount: 3 });

  return (
    <View ref={trapRef}>
      <View ref={initialRef} tabIndex={0} />
      <View ref={restoreRef} tabIndex={0} />
      <View tabIndex={getTabIndex(0)} onKeyDown={(e) => handleKeyDown(0, e)} />
      <View tabIndex={getTabIndex(1)} onKeyDown={(e) => handleKeyDown(1, e)} />
    </View>
  );
};

describe('Focus Primitives', () => {
  it('registers and pushes context stack', async () => {
    const { toJSON } = await renderWithTheme(<FocusTestComponent />);
    expect(toJSON()).toMatchSnapshot();
  });
});
