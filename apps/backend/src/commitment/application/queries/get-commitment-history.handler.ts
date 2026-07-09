import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCommitmentHistoryQuery } from './get-commitment-history.query';
import { ActivityDto } from '../../api/dtos/activity.dto';
import {
  ACTIVITY_REPOSITORY,
  type ActivityRepository,
} from '../ports/activity.repository';

@QueryHandler(GetCommitmentHistoryQuery)
export class GetCommitmentHistoryHandler implements IQueryHandler<
  GetCommitmentHistoryQuery,
  ActivityDto[]
> {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly repository: ActivityRepository,
  ) {}

  async execute(query: GetCommitmentHistoryQuery): Promise<ActivityDto[]> {
    const activities = await this.repository.findByCommitmentId(
      query.commitmentId,
    );

    return activities.map(
      (a) =>
        new ActivityDto(
          a.id,
          a.type,
          a.version,
          a.occurredAt.toISOString(),
          a.actor,
          a.metadata,
        ),
    );
  }
}
