import { Text, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { CommitmentPriority } from '../models/commitment.model';
import { PRIORITY_COLOR } from '@/features/tasks/utils/task-descriptors';

interface Props {
  priority: CommitmentPriority;
}

// Reuses Task's priority color map — same three levels, same meaning,
// same visual language across the app (see task-descriptors.ts).
export function CommitmentPriorityBadge({ priority }: Props) {
  const { t } = useTranslation();
  const { bg, text } = PRIORITY_COLOR[priority];

  return (
    <YStack backgroundColor={bg as any} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4">
      <Text color={text as any} fontSize="$2" fontWeight="bold">
        {t(`form.fields.priority.options.${priority}`, { ns: 'commitments' })}
      </Text>
    </YStack>
  );
}
