export type ActivityType =
  | 'created'
  | 'activated'
  | 'paused'
  | 'resumed'
  | 'completed'
  | 'cancelled'
  | 'edited'
  | 'unknown';

export interface Activity {
  id: string;
  type: ActivityType;
  version: number;
  occurredAt: Date;
  actor: string;
  metadata: Record<string, any>;
}
