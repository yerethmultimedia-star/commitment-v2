export interface ProjectionRepository<TProjection> {
  save(id: string, projection: TProjection): Promise<void>;
  findById(id: string): Promise<TProjection | null>;
  findAll(): TProjection[];
  delete(id: string): Promise<void>;
}
