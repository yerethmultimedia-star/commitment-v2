import { Badge, BadgeTone } from '@commitment/design-system';
import { CommitmentStatus } from '../models/commitment.model';
import { commitmentMapper } from '../mappers/commitment.mapper';

interface Props {
  status: CommitmentStatus;
}

// Maps domain status -> Badge's tone. Badge owns the actual color/contrast
// pairing (WCAG-AA-verified per theme); this component only owns the
// domain-to-tone mapping, per the Design System's Button/Badge convention.
const STATUS_TONE: Record<CommitmentStatus, BadgeTone> = {
  active: 'success',
  draft: 'neutral',
  paused: 'warning',
  completed: 'accent',
  cancelled: 'danger',
};

export function CommitmentStatusBadge({ status }: Props) {
  return (
    <Badge
      tone={STATUS_TONE[status] ?? 'neutral'}
      i18nKey={commitmentMapper.statusToTranslationKey(status)}
      i18nParams={{ ns: 'commitments' }}
    />
  );
}
