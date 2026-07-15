import { Injectable } from '@nestjs/common';
import { HabitView } from '../application/queries/habit-view.dto';

@Injectable()
export class InMemoryHabitProjectionStore {
  private readonly store = new Map<string, HabitView>();

  public save(view: HabitView): void {
    this.store.set(view.id, view);
  }

  public findById(id: string): HabitView | null {
    return this.store.get(id) ?? null;
  }

  public findAll(): HabitView[] {
    return Array.from(this.store.values());
  }

  public delete(id: string): void {
    this.store.delete(id);
  }

  public findByIdentityId(identityId: string): HabitView[] {
    return Array.from(this.store.values()).filter(
      (v) => v.identityId === identityId,
    );
  }
}
