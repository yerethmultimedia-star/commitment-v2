import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import {
  TaskRegisteredEvent,
  TaskEditedEvent,
  TaskCompletedEvent,
  TaskReopenedEvent,
  TaskStartedEvent,
  TaskBlockedEvent,
  TaskUnblockedEvent,
  TaskCancelledEvent,
  TaskReturnedToPendingEvent,
  TaskDeletedEvent,
  TaskPriorityChangedEvent,
  TaskDueDateChangedEvent,
} from '@commitment/domain';
import { InMemoryTaskProjectionStore } from '../../infrastructure/in-memory-task-projection.store';
import type { DashboardProjectionRepository } from '../ports/dashboard-projection-repository.port';
import { TaskView } from '../queries/task-view.dto';

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Injectable()
@EventsHandler(
  TaskRegisteredEvent,
  TaskEditedEvent,
  TaskCompletedEvent,
  TaskReopenedEvent,
  TaskStartedEvent,
  TaskBlockedEvent,
  TaskUnblockedEvent,
  TaskCancelledEvent,
  TaskReturnedToPendingEvent,
  TaskDeletedEvent,
  TaskPriorityChangedEvent,
  TaskDueDateChangedEvent,
)
export class DashboardProjector implements IEventHandler<any> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly taskStore: InMemoryTaskProjectionStore,
    @Inject('DashboardProjectionRepository')
    private readonly dashboardRepo: DashboardProjectionRepository,
  ) {}

  public async handle(event: unknown): Promise<void> {
    let identityId: string | undefined;

    if (event instanceof TaskRegisteredEvent) {
      identityId = event.payload.identityId;
    } else {
      const ev = event as { payload?: { taskId?: string } };
      const taskId = ev.payload?.taskId;
      if (taskId) {
        const task = this.taskStore.findById(taskId);
        identityId = task?.identityId;
      }
    }

    if (!identityId) return;

    // Recalculate dashboard projection
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const tasks = this.taskStore
      .findByIdentityId(identityId)
      .filter((task) => !task.deletedAt && task.status !== 'cancelled');

    const byDueDate = (a: TaskView, b: TaskView) =>
      new Date(a.dueDate ?? '9999-12-31').getTime() -
      new Date(b.dueDate ?? '9999-12-31').getTime();

    // ADR-022: "today"/"upcoming" show anything still actionable and due —
    // Pending, InProgress, and Blocked — not just Pending. A Blocked task
    // due today still needs attention (that's the point of surfacing it),
    // and an InProgress task due today shouldn't disappear from view just
    // because it's been started.
    const isActionable = (task: TaskView) =>
      task.status === 'pending' ||
      task.status === 'in_progress' ||
      task.status === 'blocked';

    const today = tasks
      .filter(
        (task) =>
          isActionable(task) &&
          task.dueDate &&
          new Date(task.dueDate) >= todayStart &&
          new Date(task.dueDate) < tomorrow,
      )
      .sort(byDueDate);

    const upcoming = tasks
      .filter(
        (task) =>
          isActionable(task) &&
          task.dueDate &&
          new Date(task.dueDate) >= tomorrow,
      )
      .sort(byDueDate)
      .slice(0, 5);

    const completedThisWeek = tasks.filter(
      (task) => task.completedAt && new Date(task.completedAt) >= weekStart,
    ).length;

    const relevant = tasks.filter(
      (task) => new Date(task.createdAt) >= weekStart,
    );

    const completionRate = relevant.length
      ? Math.round(
          (relevant.filter((task) => task.status === 'completed').length /
            relevant.length) *
            100,
        )
      : 0;

    const recentActivity = tasks
      .filter((task) => task.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      )
      .slice(0, 5);

    await this.dashboardRepo.save(identityId, {
      identityId,
      today,
      upcoming,
      recentActivity,
      metrics: {
        pending: tasks.filter((task) => task.status === 'pending').length,
        completedThisWeek,
        completionRate,
      },
      updatedAt: now.toISOString(),
    });
  }
}
