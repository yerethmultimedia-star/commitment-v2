import { TaskModel } from '../models/task.model';

// Solid semantic background + contentOnSemantic — a tinted background
// (e.g. $focus) with semantic-colored text on top measured under 1.5:1
// contrast in this theme; see CommitmentStatusBadge for the same fix.
export const PRIORITY_COLOR: Record<TaskModel['priority'], { bg: string; text: string }> = {
  high: { bg: '$danger', text: '$contentOnSemantic' },
  medium: { bg: '$warning', text: '$contentOnSemantic' },
  low: { bg: '$surfaceRaised', text: '$contentSecondary' },
};
