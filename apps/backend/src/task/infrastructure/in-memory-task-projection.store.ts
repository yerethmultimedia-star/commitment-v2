import { TaskView } from '../application/queries/task-view.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryTaskProjectionStore {
  private readonly store = new Map<string, TaskView>();

  public save(view: TaskView): void {
    this.store.set(view.id, view);
  }

  public findById(id: string): TaskView | null {
    return this.store.get(id) ?? null;
  }

  public findAll(): TaskView[] {
    return Array.from(this.store.values());
  }

  public delete(id: string): void {
    this.store.delete(id);
  }

  public findByIdentityId(identityId: string): TaskView[] {
    return Array.from(this.store.values()).filter(
      (v) => v.identityId === identityId,
    );
  }
}
