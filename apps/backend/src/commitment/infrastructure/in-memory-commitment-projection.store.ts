import { CommitmentView } from '../application/queries/commitment-view.dto';

export class InMemoryCommitmentProjectionStore {
  private readonly store = new Map<string, CommitmentView>();

  public save(view: CommitmentView): void {
    this.store.set(view.id, view);
  }

  public findById(id: string): CommitmentView | null {
    return this.store.get(id) ?? null;
  }

  public findAll(): CommitmentView[] {
    return Array.from(this.store.values());
  }

  public delete(id: string): void {
    this.store.delete(id);
  }
}
