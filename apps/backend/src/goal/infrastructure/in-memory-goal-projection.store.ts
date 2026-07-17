import { GoalView } from '../application/queries/goal-view.dto';

export class InMemoryGoalProjectionStore {
  private readonly store = new Map<string, GoalView>();

  public save(view: GoalView): void {
    this.store.set(view.id, view);
  }

  public findById(id: string): GoalView | null {
    return this.store.get(id) ?? null;
  }

  public findAll(): GoalView[] {
    return Array.from(this.store.values());
  }

  public delete(id: string): void {
    this.store.delete(id);
  }
}
