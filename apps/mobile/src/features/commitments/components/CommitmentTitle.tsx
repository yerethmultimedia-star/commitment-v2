import { Text } from 'tamagui';

interface Props {
  title: string;
}

export function CommitmentTitle({ title }: Props) {
  return (
    <Text color="$text" fontSize="$5" fontWeight="bold" numberOfLines={2}>
      {title}
    </Text>
  );
}
