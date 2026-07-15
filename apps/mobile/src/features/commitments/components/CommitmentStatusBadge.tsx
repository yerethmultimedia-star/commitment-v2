import { Text, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { CommitmentStatus } from '../models/commitment.model';
import { commitmentMapper } from '../mappers/commitment.mapper';

interface Props {
  status: CommitmentStatus;
}

export function CommitmentStatusBadge({ status }: Props) {
  const { t } = useTranslation();

  // Solid semantic background + contentOnSemantic/contentOnAccent text —
  // light-tinted backgrounds (e.g. $focus) with a semantic-colored text on
  // top measured well under WCAG AA (some combinations under 1.5:1). See
  // DashboardHeroCard for the same pattern: success/warning/danger get
  // contentOnSemantic (dark), accent gets contentOnAccent (white) since
  // accent isn't dark enough for dark text to clear 4.5:1 against white.
  const getColors = () => {
    switch (status) {
      case 'active':
        return { bg: '$success', text: '$contentOnSemantic' };
      case 'draft':
        return { bg: '$surfaceRaised', text: '$contentSecondary' };
      case 'paused':
        return { bg: '$warning', text: '$contentOnSemantic' };
      case 'completed':
        return { bg: '$accent', text: '$contentOnAccent' };
      case 'cancelled':
        return { bg: '$danger', text: '$contentOnSemantic' };
      default:
        return { bg: '$surfaceRaised', text: '$contentSecondary' };
    }
  };

  const { bg, text } = getColors();

  return (
    <YStack backgroundColor={bg} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4">
      <Text color={text} fontSize="$2" fontWeight="bold">
        {t(commitmentMapper.statusToTranslationKey(status), { ns: 'commitments' })}
      </Text>
    </YStack>
  );
}
