import { Spinner } from 'tamagui';
import { FullScreenCenter } from '../FullScreenCenter';

export function LoadingState() {
  return (
    <FullScreenCenter>
      <Spinner size="large" color="$accent" />
    </FullScreenCenter>
  );
}
