import { ActivityRecord } from '../models/activity.record';

export interface ActivityRepository {
  save(activity: ActivityRecord): Promise<void>;
  findByCommitmentId(commitmentId: string): Promise<ActivityRecord[]>;
}

export const ACTIVITY_REPOSITORY = 'ActivityRepository';
