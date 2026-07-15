import { CommitmentModel, CommitmentPriority, CommitmentStatus } from '../models/commitment.model';

export const commitmentMapper = {
  fromDTO: (dto: any): CommitmentModel => {
    const statusMap: Record<string, CommitmentStatus> = {
      Active: 'active',
      Draft: 'draft',
      Paused: 'paused',
      Completed: 'completed',
      Cancelled: 'cancelled',
    };

    return {
      id: dto.id,
      title: dto.title,
      status: statusMap[dto.state] || 'draft',
      priority: (dto.priority as CommitmentPriority) || 'medium',
      targetDate: dto.targetDate || undefined,
      recurrencePattern: dto.recurrencePattern || undefined,
      goalId: dto.goalId || undefined,
    };
  },

  statusToTranslationKey: (status: CommitmentStatus): string => {
    return `status.${status}`;
  },
};
