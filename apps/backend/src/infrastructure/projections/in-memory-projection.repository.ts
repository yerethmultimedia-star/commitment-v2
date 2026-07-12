import { ProjectionRepository } from './projection-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryProjectionRepository<
  TProjection,
> implements ProjectionRepository<TProjection> {
  protected readonly projections = new Map<string, TProjection>();

  save(id: string, projection: TProjection): Promise<void> {
    this.projections.set(id, projection);
    return Promise.resolve();
  }

  findById(id: string): Promise<TProjection | null> {
    const result = this.projections.get(id) || null;
    return Promise.resolve(result);
  }

  findAll(): TProjection[] {
    return Array.from(this.projections.values());
  }

  delete(id: string): Promise<void> {
    this.projections.delete(id);
    return Promise.resolve();
  }
}
