import { ProjectionRepository } from '../../../infrastructure/projections/projection-repository.interface';
import { DashboardProjection } from '../projections/dashboard-projection';

export interface DashboardProjectionRepository extends ProjectionRepository<DashboardProjection> {
  findByIdentityId(identityId: string): Promise<DashboardProjection | null>;
}
