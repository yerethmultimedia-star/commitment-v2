import { Injectable } from '@nestjs/common';
import { ActivityRecord } from '../application/models/activity.record';
import { ActivityRepository } from '../application/ports/activity.repository';

@Injectable()
export class InMemoryActivityRepository implements ActivityRepository {
  private readonly activities: ActivityRecord[] = [];

  async save(activity: ActivityRecord): Promise<void> {
    this.activities.push(activity);
    await Promise.resolve();
  }

  async findByCommitmentId(commitmentId: string): Promise<ActivityRecord[]> {
    await Promise.resolve();
    return this.activities
      .filter((a) => a.commitmentId === commitmentId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }
}
