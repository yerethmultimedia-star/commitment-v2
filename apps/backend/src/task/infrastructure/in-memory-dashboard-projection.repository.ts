import { InMemoryProjectionRepository } from '../../infrastructure/projections/in-memory-projection.repository';
import { DashboardProjection } from '../application/projections/dashboard-projection';
import { DashboardProjectionRepository } from '../application/ports/dashboard-projection-repository.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryDashboardProjectionRepository
  extends InMemoryProjectionRepository<DashboardProjection>
  implements DashboardProjectionRepository
{
  async findByIdentityId(
    identityId: string,
  ): Promise<DashboardProjection | null> {
    return this.findById(identityId);
  }
}
