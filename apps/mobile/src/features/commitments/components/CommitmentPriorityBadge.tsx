import { Badge, BadgeTone } from '@commitment/design-system';
import { CommitmentPriority } from '../models/commitment.model';

// Same three levels, same meaning, same tone mapping as Task's priority
// (see task-descriptors.ts's PRIORITY_TONE) — kept as a literal map here too
// rather than a cross-feature import, since Commitment and Task are
// different bounded contexts that happen to share a priority vocabulary,
// not a shared priority concept that should be imported across contexts.
const PRIORITY_TONE: Record<CommitmentPriority, BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

interface Props {
  priority: CommitmentPriority;
}

export function CommitmentPriorityBadge({ priority }: Props) {
  return <Badge tone={PRIORITY_TONE[priority]} i18nKey={`commitments:form.fields.priority.options.${priority}`} />;
}
