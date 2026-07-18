import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  GoalRegisteredEvent,
  GoalRenamedEvent,
  GoalDescriptionUpdatedEvent,
  GoalActivatedEvent,
  GoalCompletedEvent,
  GoalArchivedEvent,
  GoalCommitmentLinkedEvent,
  GoalHabitLinkedEvent,
} from '@commitment/domain';
import { Inject } from '@nestjs/common';
import { InMemoryGoalProjectionStore } from '../../infrastructure/in-memory-goal-projection.store';

@EventsHandler(GoalRegisteredEvent)
export class GoalRegisteredProjector implements IEventHandler<GoalRegisteredEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalRegisteredEvent): void {
    this.store.save({
      id: event.payload.goalId,
      identityId: event.payload.identityId,
      title: event.payload.title,
      description: event.payload.description || null,
      state: 'Draft',
      version: 1,
      commitmentIds: [],
      habitIds: [],
      completedAt: null,
    });
  }
}

@EventsHandler(GoalRenamedEvent)
export class GoalRenamedProjector implements IEventHandler<GoalRenamedEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalRenamedEvent): void {
    const view = this.store.findById(event.payload.goalId);
    if (view) {
      view.title = event.payload.title;
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(GoalDescriptionUpdatedEvent)
export class GoalDescriptionUpdatedProjector implements IEventHandler<GoalDescriptionUpdatedEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalDescriptionUpdatedEvent): void {
    const view = this.store.findById(event.payload.goalId);
    if (view) {
      view.description = event.payload.description || null;
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(GoalActivatedEvent)
export class GoalActivatedProjector implements IEventHandler<GoalActivatedEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalActivatedEvent): void {
    const view = this.store.findById(event.payload.goalId);
    if (view) {
      view.state = 'Active';
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(GoalCompletedEvent)
export class GoalCompletedProjector implements IEventHandler<GoalCompletedEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalCompletedEvent): void {
    const view = this.store.findById(event.payload.goalId);
    if (view) {
      view.state = 'Completed';
      view.completedAt = event.payload.completedAt;
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(GoalArchivedEvent)
export class GoalArchivedProjector implements IEventHandler<GoalArchivedEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalArchivedEvent): void {
    const view = this.store.findById(event.payload.goalId);
    if (view) {
      view.state = 'Archived';
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(GoalCommitmentLinkedEvent)
export class GoalCommitmentLinkedProjector implements IEventHandler<GoalCommitmentLinkedEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalCommitmentLinkedEvent): void {
    const view = this.store.findById(event.payload.goalId);
    if (view) {
      view.commitmentIds = [...view.commitmentIds, event.payload.commitmentId];
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(GoalHabitLinkedEvent)
export class GoalHabitLinkedProjector implements IEventHandler<GoalHabitLinkedEvent> {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public handle(event: GoalHabitLinkedEvent): void {
    const view = this.store.findById(event.payload.goalId);
    if (view) {
      view.habitIds = [...view.habitIds, event.payload.habitId];
      view.version += 1;
      this.store.save(view);
    }
  }
}

export const GoalProjectors = [
  GoalRegisteredProjector,
  GoalRenamedProjector,
  GoalDescriptionUpdatedProjector,
  GoalActivatedProjector,
  GoalCompletedProjector,
  GoalArchivedProjector,
  GoalCommitmentLinkedProjector,
  GoalHabitLinkedProjector,
];
