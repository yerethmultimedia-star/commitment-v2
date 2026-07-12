import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardQuery } from './get-dashboard.query';
import { DashboardViewModel } from './dashboard-view.dto';
import type { DashboardProjectionRepository } from '../ports/dashboard-projection-repository.port';

@QueryHandler(GetDashboardQuery)
@Injectable()
export class GetDashboardQueryHandler implements IQueryHandler<GetDashboardQuery> {
  constructor(
    @Inject('DashboardProjectionRepository')
    private readonly dashboardRepo: DashboardProjectionRepository,
  ) {}

  async execute(query: GetDashboardQuery): Promise<DashboardViewModel> {
    const projection = await this.dashboardRepo.findByIdentityId(
      query.identityId,
    );
    if (!projection) {
      return {
        today: [],
        upcoming: [],
        recentActivity: [],
        metrics: {
          pending: 0,
          completedThisWeek: 0,
          completionRate: 0,
        },
      };
    }
    return {
      today: projection.today,
      upcoming: projection.upcoming,
      recentActivity: projection.recentActivity,
      metrics: projection.metrics,
    };
  }
}
