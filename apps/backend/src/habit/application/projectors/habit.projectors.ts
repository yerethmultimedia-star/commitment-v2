import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HabitRegisteredEvent,
  HabitEditedEvent,
  HabitCompletedEvent,
  HabitUncompletedEvent,
  HabitPostponedEvent,
  HabitOccurrenceMissedEvent,
  HabitEnabledEvent,
  HabitDisabledEvent,
  HabitArchivedEvent,
  HabitState,
} from '@commitment/domain';
import { InMemoryHabitProjectionStore } from '../../infrastructure/in-memory-habit-projection.store';

@EventsHandler(HabitRegisteredEvent)
export class HabitRegisteredProjector implements IEventHandler<HabitRegisteredEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitRegisteredEvent): void {
    this.store.save({
      id: event.payload.habitId,
      identityId: event.payload.identityId,
      title: event.payload.title,
      recurrenceType: event.payload.recurrenceType,
      daysOfWeek: [...event.payload.daysOfWeek],
      dayOfMonth: event.payload.dayOfMonth,
      month: event.payload.month,
      reminderHour: event.payload.reminderHour,
      reminderMinute: event.payload.reminderMinute,
      recurrenceAnchorDate: event.payload.createdAt,
      state: HabitState.Active,
      goalId: event.payload.goalId ?? null,
      lastCompletedDate: null,
      currentStreakDays: 0,
      postponedUntil: null,
      createdAt: event.payload.createdAt,
      updatedAt: event.payload.createdAt,
      version: 1,
    });
  }
}

@EventsHandler(HabitEditedEvent)
export class HabitEditedProjector implements IEventHandler<HabitEditedEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitEditedEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    if (event.payload.title !== undefined) view.title = event.payload.title;
    if (event.payload.recurrenceType !== undefined)
      view.recurrenceType = event.payload.recurrenceType;
    if (event.payload.daysOfWeek !== undefined)
      view.daysOfWeek = [...event.payload.daysOfWeek];
    if (event.payload.dayOfMonth !== undefined)
      view.dayOfMonth = event.payload.dayOfMonth;
    if (event.payload.month !== undefined) view.month = event.payload.month;
    if (event.payload.reminderHour !== undefined)
      view.reminderHour = event.payload.reminderHour;
    if (event.payload.reminderMinute !== undefined)
      view.reminderMinute = event.payload.reminderMinute;
    if (event.payload.resetRecurrenceAnchor)
      view.recurrenceAnchorDate = event.metadata.occurredAt;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(HabitCompletedEvent)
export class HabitCompletedProjector implements IEventHandler<HabitCompletedEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitCompletedEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    view.lastCompletedDate = event.payload.completedOn;
    view.currentStreakDays = event.payload.streakDays;
    view.postponedUntil = null;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(HabitUncompletedEvent)
export class HabitUncompletedProjector implements IEventHandler<HabitUncompletedEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitUncompletedEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    view.lastCompletedDate = null;
    view.currentStreakDays = Math.max(0, view.currentStreakDays - 1);
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(HabitPostponedEvent)
export class HabitPostponedProjector implements IEventHandler<HabitPostponedEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitPostponedEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    view.postponedUntil = event.payload.postponedUntil;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(HabitOccurrenceMissedEvent)
export class HabitOccurrenceMissedProjector implements IEventHandler<HabitOccurrenceMissedEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitOccurrenceMissedEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    view.currentStreakDays = event.payload.streakDays;
    view.postponedUntil = null;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(HabitEnabledEvent)
export class HabitEnabledProjector implements IEventHandler<HabitEnabledEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitEnabledEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    view.state = HabitState.Active;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(HabitDisabledEvent)
export class HabitDisabledProjector implements IEventHandler<HabitDisabledEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitDisabledEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    view.state = HabitState.Disabled;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

@EventsHandler(HabitArchivedEvent)
export class HabitArchivedProjector implements IEventHandler<HabitArchivedEvent> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public handle(event: HabitArchivedEvent): void {
    const view = this.store.findById(event.payload.habitId);
    if (!view) return;
    view.state = HabitState.Archived;
    view.updatedAt = event.metadata.occurredAt;
    view.version += 1;
    this.store.save(view);
  }
}

export const HabitProjectors = [
  HabitRegisteredProjector,
  HabitEditedProjector,
  HabitCompletedProjector,
  HabitUncompletedProjector,
  HabitPostponedProjector,
  HabitOccurrenceMissedProjector,
  HabitEnabledProjector,
  HabitDisabledProjector,
  HabitArchivedProjector,
];
