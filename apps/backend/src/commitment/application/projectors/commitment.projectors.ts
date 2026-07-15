import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  CommitmentRegisteredEvent,
  CommitmentActivatedEvent,
  CommitmentPausedEvent,
  CommitmentResumedEvent,
  CommitmentCompletedEvent,
  CommitmentCancelledEvent,
  CommitmentRenamedEvent,
  CommitmentDescriptionUpdatedEvent,
  CommitmentPriorityChangedEvent,
} from '@commitment/domain';
import { Inject } from '@nestjs/common';
import { InMemoryCommitmentProjectionStore } from '../../infrastructure/in-memory-commitment-projection.store';

@EventsHandler(CommitmentRegisteredEvent)
export class CommitmentRegisteredProjector implements IEventHandler<CommitmentRegisteredEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentRegisteredEvent): void {
    this.store.save({
      id: event.payload.commitmentId,
      identityId: event.payload.identityId,
      title: event.payload.title,
      description: event.payload.description,
      state: 'Draft',
      version: 1,
      recurrencePattern: event.payload.recurrencePattern,
      targetDate: event.payload.targetDate,
      seriesId: event.payload.seriesId,
      priority: event.payload.priority,
    });
  }
}

@EventsHandler(CommitmentActivatedEvent)
export class CommitmentActivatedProjector implements IEventHandler<CommitmentActivatedEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentActivatedEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.state = 'Active';
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(CommitmentPausedEvent)
export class CommitmentPausedProjector implements IEventHandler<CommitmentPausedEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentPausedEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.state = 'Paused';
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(CommitmentResumedEvent)
export class CommitmentResumedProjector implements IEventHandler<CommitmentResumedEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentResumedEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.state = 'Active';
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(CommitmentCompletedEvent)
export class CommitmentCompletedProjector implements IEventHandler<CommitmentCompletedEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentCompletedEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.state = 'Completed';
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(CommitmentCancelledEvent)
export class CommitmentCancelledProjector implements IEventHandler<CommitmentCancelledEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentCancelledEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.state = 'Cancelled';
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(CommitmentRenamedEvent)
export class CommitmentRenamedProjector implements IEventHandler<CommitmentRenamedEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentRenamedEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.title = event.payload.title;
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(CommitmentDescriptionUpdatedEvent)
export class CommitmentDescriptionUpdatedProjector implements IEventHandler<CommitmentDescriptionUpdatedEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentDescriptionUpdatedEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.description = event.payload.description;
      view.version += 1;
      this.store.save(view);
    }
  }
}

@EventsHandler(CommitmentPriorityChangedEvent)
export class CommitmentPriorityChangedProjector implements IEventHandler<CommitmentPriorityChangedEvent> {
  constructor(
    @Inject('CommitmentProjectionStore')
    private readonly store: InMemoryCommitmentProjectionStore,
  ) {}

  public handle(event: CommitmentPriorityChangedEvent): void {
    const view = this.store.findById(event.payload.commitmentId);
    if (view) {
      view.priority = event.payload.priority;
      view.version += 1;
      this.store.save(view);
    }
  }
}

export const CommitmentProjectors = [
  CommitmentRegisteredProjector,
  CommitmentActivatedProjector,
  CommitmentPausedProjector,
  CommitmentResumedProjector,
  CommitmentCompletedProjector,
  CommitmentCancelledProjector,
  CommitmentRenamedProjector,
  CommitmentDescriptionUpdatedProjector,
  CommitmentPriorityChangedProjector,
];
